import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";

export async function GET() {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: BigInt(payload.id) },
      include: {
        province: { select: { id: true, name: true, slug: true } },
        city: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: addresses.map((a) => ({
        id: a.id.toString(),
        title: a.title,
        provinceId: a.provinceId.toString(),
        provinceName: a.province?.name ?? "",
        provinceSlug: a.province?.slug ?? "",
        cityId: a.cityId.toString(),
        cityName: a.city?.name ?? "",
        citySlug: a.city?.slug ?? "",
        postalCode: a.postalCode,
        fullAddress: a.fullAddress,
        receiverName: a.receiverName,
        receiverPhone: a.receiverPhone,
        isDefault: a.isDefault,
      })),
    });
  } catch (error) {
    console.error("GET /api/addresses error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت آدرس‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, provinceId, cityId, postalCode, fullAddress, receiverName, receiverPhone, isDefault } = body;

    if (!title || !provinceId || !cityId || !postalCode || !fullAddress) {
      return NextResponse.json(
        { success: false, message: "تمام فیلدهای ضروری را پر کنید" },
        { status: 400 }
      );
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: BigInt(payload.id), isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: BigInt(payload.id),
        title,
        provinceId: BigInt(provinceId),
        cityId: BigInt(cityId),
        postalCode,
        fullAddress,
        receiverName: receiverName || null,
        receiverPhone: receiverPhone || null,
        isDefault: isDefault ?? false,
      },
      include: {
        province: { select: { id: true, name: true, slug: true } },
        city: { select: { id: true, name: true, slug: true } },
      },
    });

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
    console.error("POST /api/addresses error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ایجاد آدرس" },
      { status: 500 }
    );
  }
}