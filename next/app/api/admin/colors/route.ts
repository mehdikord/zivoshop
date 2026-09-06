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
  const sortBy = searchParams.get("sortBy") ?? "name";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  const where: Record<string, unknown> = search ? { name: { contains: search } } : {};
  const allowedSort = ["name"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "name";

  const [colors, total] = await Promise.all([
    prisma.color.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      include: { _count: { select: { productColors: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.color.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: colors.map((c) => ({
      id: c.id.toString(),
      name: c.name,
      hex: c.hex,
      productCount: c._count.productColors,
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
  const { name, hex } = body;

  if (!name) {
    return NextResponse.json({ success: false, message: "نام رنگ الزامی است" }, { status: 400 });
  }

  const existing = await prisma.color.findFirst({ where: { name } });
  if (existing) {
    return NextResponse.json({ success: false, message: "این نام رنگ قبلاً استفاده شده" }, { status: 409 });
  }

  const color = await prisma.color.create({
    data: { name, hex: hex || "#000000" },
  });

  return NextResponse.json({
    success: true,
    data: { id: color.id.toString(), name: color.name },
  }, { status: 201 });
}
