import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const address = await prisma.address.findFirst({
      where: { id: BigInt(id), userId: BigInt(payload.id) },
      include: {
        province: { select: { id: true, name: true, slug: true } },
        city: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: "آدرس یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: address.id.toString(),
        title: address.title,
        provinceId: address.provinceId.toString(),
        provinceName: address.province?.name ?? "",
        provinceSlug: address.province?.slug ?? "",
        cityId: address.cityId.toString(),
        cityName: address.city?.name ?? "",
        citySlug: address.city?.slug ?? "",
        postalCode: address.postalCode,
        fullAddress: address.fullAddress,
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        isDefault: address.isDefault,
      },
    });
  } catch (error) {
    console.error("GET /api/addresses/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت آدرس" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, provinceId, cityId, postalCode, fullAddress, receiverName, receiverPhone, isDefault } = body;

    const existing = await prisma.address.findFirst({
      where: { id: BigInt(id), userId: BigInt(payload.id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "آدرس یافت نشد" },
        { status: 404 }
      );
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: BigInt(payload.id), isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: BigInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(provinceId !== undefined && { provinceId: BigInt(provinceId) }),
        ...(cityId !== undefined && { cityId: BigInt(cityId) }),
        ...(postalCode !== undefined && { postalCode }),
        ...(fullAddress !== undefined && { fullAddress }),
        ...(receiverName !== undefined && { receiverName: receiverName || null }),
        ...(receiverPhone !== undefined && { receiverPhone: receiverPhone || null }),
        ...(isDefault !== undefined && { isDefault }),
      },
      include: {
        province: { select: { id: true, name: true, slug: true } },
        city: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id.toString(),
        title: updated.title,
        provinceId: updated.provinceId.toString(),
        provinceName: updated.province?.name ?? "",
        provinceSlug: updated.province?.slug ?? "",
        cityId: updated.cityId.toString(),
        cityName: updated.city?.name ?? "",
        citySlug: updated.city?.slug ?? "",
        postalCode: updated.postalCode,
        fullAddress: updated.fullAddress,
        receiverName: updated.receiverName,
        receiverPhone: updated.receiverPhone,
        isDefault: updated.isDefault,
      },
    });
  } catch (error) {
    console.error("PATCH /api/addresses/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی آدرس" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await prisma.address.findFirst({
      where: { id: BigInt(id), userId: BigInt(payload.id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "آدرس یافت نشد" },
        { status: 404 }
      );
    }

    await prisma.address.delete({ where: { id: BigInt(id) } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("DELETE /api/addresses/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در حذف آدرس" },
      { status: 500 }
    );
  }
}