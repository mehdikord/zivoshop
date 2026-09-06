import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({
    where: { id: BigInt(id) },
  });

  if (!coupon) {
    return NextResponse.json({ success: false, message: "کوپن یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: coupon.id.toString(),
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() ?? null,
      maxUses: coupon.maxUses ?? null,
      usedCount: coupon.usedCount,
      startsAt: coupon.startsAt?.toISOString() ?? null,
      expiresAt: coupon.expiresAt?.toISOString() ?? null,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt?.toISOString() ?? null,
      updatedAt: coupon.updatedAt?.toISOString() ?? null,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json();

  const value = body.value !== undefined ? Number(toEnglishDigits(body.value)) : undefined;
  const minOrderAmount =
    body.minOrderAmount === undefined
      ? undefined
      : body.minOrderAmount === "" || body.minOrderAmount === null
        ? null
        : BigInt(toEnglishDigits(body.minOrderAmount));
  const maxUses =
    body.maxUses !== undefined && body.maxUses !== "" && body.maxUses !== null
      ? Number(toEnglishDigits(body.maxUses))
      : body.maxUses === "" || body.maxUses === null
        ? null
        : undefined;
  const { code, type, startsAt, expiresAt, isActive } = body;

  const existing = await prisma.coupon.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "کوپن یافت نشد" }, { status: 404 });
  }

  if (code && code !== existing.code) {
    const codeExists = await prisma.coupon.findUnique({ where: { code } });
    if (codeExists) {
      return NextResponse.json({ success: false, message: "این کد قبلاً استفاده شده" }, { status: 409 });
    }
  }

  const effectiveType = type !== undefined ? type : existing.type;
  if (!["fixed", "percent"].includes(effectiveType)) {
    return NextResponse.json({ success: false, message: "نوع کوپن نامعتبر است" }, { status: 400 });
  }

  const percentValue = value !== undefined ? value : Number(existing.value);
  if (effectiveType === "percent" && (percentValue < 1 || percentValue > 100)) {
    return NextResponse.json({ success: false, message: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (code !== undefined) updateData.code = code;
  if (type !== undefined) updateData.type = type;
  if (value !== undefined) updateData.value = BigInt(value);
  if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
  if (maxUses !== undefined) updateData.maxUses = maxUses;
  if (startsAt !== undefined) updateData.startsAt = startsAt ? new Date(startsAt) : null;
  if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (isActive !== undefined) updateData.isActive = isActive;

  const coupon = await prisma.coupon.update({
    where: { id: BigInt(id) },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    data: {
      id: coupon.id.toString(),
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.coupon.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "کوپن یافت نشد" }, { status: 404 });
  }

  const orderCount = await prisma.order.count({ where: { couponId: BigInt(id) } });
  if (orderCount > 0) {
    return NextResponse.json(
      { success: false, message: "نمی‌توان کوپنی که در سفارش استفاده شده را حذف کرد" },
      { status: 400 }
    );
  }

  await prisma.coupon.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ success: true, message: "کوپن حذف شد" });
}