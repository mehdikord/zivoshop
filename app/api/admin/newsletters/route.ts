import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const search = searchParams.get("search") ?? "";
  const isActive = searchParams.get("isActive") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
    ];
  }
  if (isActive !== "") where.isActive = isActive === "true";

  const allowedSort = ["email", "isActive", "createdAt"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "createdAt";

  const [newsletters, total] = await Promise.all([
    prisma.newsletter.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsletter.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: newsletters.map((n) => ({
      id: n.id.toString(),
      email: n.email,
      isActive: n.isActive,
      createdAt: n.createdAt?.toISOString() ?? null,
    })),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ success: false, message: "ایمیل الزامی است" }, { status: 400 });
  }

  const existing = await prisma.newsletter.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, message: "این ایمیل قبلاً ثبت شده" }, { status: 409 });
  }

  const newsletter = await prisma.newsletter.create({
    data: { email },
  });

  return NextResponse.json({
    success: true,
    data: { id: newsletter.id.toString(), email: newsletter.email },
  }, { status: 201 });
}