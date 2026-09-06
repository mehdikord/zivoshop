import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const DEFAULT_SHIPPING_THRESHOLD = 2_000_000;
export const DEFAULT_SHIPPING_FEE = 45_000;

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: ["free_shipping_threshold", "shipping_fee_base"] } },
    });

    const valueFor = (key: string): number => {
      const raw = Number(settings.find((s) => s.key === key)?.value);
      return Number.isFinite(raw) && raw >= 0 ? raw : 0;
    };

    const storedThreshold = valueFor("free_shipping_threshold");
    const storedBaseFee = valueFor("shipping_fee_base");

    const freeShippingThreshold =
      storedThreshold > 0 ? storedThreshold : DEFAULT_SHIPPING_THRESHOLD;
    const baseShippingFee =
      storedBaseFee > 0 ? storedBaseFee : DEFAULT_SHIPPING_FEE;

    const provinces = await prisma.province.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        shippingCost: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        freeShippingThreshold,
        baseShippingFee,
        provinces: provinces.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          slug: p.slug,
          shippingCost: Number(p.shippingCost),
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/shipping-settings error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تنظیمات ارسال" },
      { status: 500 }
    );
  }
}