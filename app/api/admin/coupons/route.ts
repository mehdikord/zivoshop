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
  const type = searchParams.get("type") ?? "";
  const isActive = searchParams.get("isActive") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { code: { contains: search } },
    ];
  }
  if (type) where.type = type;
  if (isActive !== "") where.isActive = isActive === "true";

  const allowedSort = ["code", "type", "value", "usedCount", "maxUses", "startsAt", "expiresAt", "createdAt"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "createdAt";

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.coupon.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: coupons.map((c) => ({
      id: c.id.toString(),
      code: c.code,
      type: c.type,
      value: c.value.toString(),
      minOrderAmount: c.minOrderAmount?.toString() ?? null,
      maxUses: c.maxUses ?? null,
      usedCount: c.usedCount,
      startsAt: c.startsAt?.toISOString() ?? null,
      expiresAt: c.expiresAt?.toISOString() ?? null,
      isActive: c.isActive,
      createdAt: c.createdAt?.toISOString() ?? null,
      updatedAt: c.updatedAt?.toISOString() ?? null,
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
  const { code, type, value: valueRaw, minOrderAmount: minOrderAmountRaw, maxUses, startsAt, expiresAt, isActive } = body;

  if (!code || !type || valueRaw === undefined) {
    return NextResponse.json({ success: false, message: "کد، نوع و مقدار الزامی است" }, { status: 400 });
  }

  if (!["fixed", "percent"].includes(type)) {
    return NextResponse.json({ success: false, message: "نوع کوپن نامعتبر است" }, { status: 400 });
  }

  const value = Number(toEnglishDigits(valueRaw));
  const minOrderAmount =
    minOrderAmountRaw === undefined || minOrderAmountRaw === "" || minOrderAmountRaw === null
      ? null
      : BigInt(toEnglishDigits(minOrderAmountRaw));

  if (type === "percent" && (value < 1 || value > 100)) {
    return NextResponse.json({ success: false, message: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد" }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ success: false, message: "این کد قبلاً استفاده شده" }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type,
      value: BigInt(value),
      minOrderAmount,
      maxUses: maxUses !== undefined && maxUses !== "" && maxUses !== null ? Number(toEnglishDigits(maxUses)) : null,
      startsAt: startsAt ? new Date(startsAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive ?? true,
    },
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.COUPON_CREATED, subjectType: "Coupon", subjectId: coupon.id, properties: { code: coupon.code, type: coupon.type, value: coupon.value.toString() }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

  return NextResponse.json({
    success: true,
    data: {
      id: coupon.id.toString(),
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
    },
  }, { status: 201 });
}