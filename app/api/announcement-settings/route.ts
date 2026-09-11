import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

export const DEFAULT_SHIPPING_THRESHOLD = 2_000_000;

export async function GET() {
  try {
    const settings = await getSiteSettings();

    const thresholdRow = await prisma.siteSetting.findUnique({
      where: { key: "free_shipping_threshold" },
      select: { value: true },
    });
    const rawThreshold = Number(thresholdRow?.value);
    const freeShippingThreshold =
      Number.isFinite(rawThreshold) && rawThreshold > 0
        ? rawThreshold
        : DEFAULT_SHIPPING_THRESHOLD;

    return NextResponse.json({
      success: true,
      data: {
        contactPhone: settings.contactPhone,
        freeShippingThreshold,
      },
    });
  } catch (error) {
    console.error("GET /api/announcement-settings error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات اطلاعیه" },
      { status: 500 }
    );
  }
}