import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "sortOrder";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  const where: Record<string, unknown> = search ? { name: { contains: search } } : {};
  const allowedSort = ["name", "sortOrder"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "sortOrder";

  const [sizes, total] = await Promise.all([
    prisma.size.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      include: { _count: { select: { productSizes: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.size.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: sizes.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      sortOrder: s.sortOrder,
      productCount: s._count.productSizes,
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
  const { name, sortOrder } = body;

  if (!name) {
    return NextResponse.json({ success: false, message: "نام سایز الزامی است" }, { status: 400 });
  }

  const existing = await prisma.size.findFirst({ where: { name } });
  if (existing) {
    return NextResponse.json({ success: false, message: "این نام سایز قبلاً استفاده شده" }, { status: 409 });
  }

  const size = await prisma.size.create({
    data: { name, sortOrder: Number(toEnglishDigits(sortOrder ?? 0)) },
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.SIZE_CREATED, subjectType: "Size", subjectId: size.id, properties: { name: size.name }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

  return NextResponse.json({
    success: true,
    data: { id: size.id.toString(), name: size.name },
  }, { status: 201 });
}
