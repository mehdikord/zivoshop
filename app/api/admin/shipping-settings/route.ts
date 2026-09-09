import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export const DEFAULT_SHIPPING_THRESHOLD = 2_000_000;
export const DEFAULT_SHIPPING_FEE = 45_000;

async function readShippingConfig() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["free_shipping_threshold", "shipping_fee_base"] } },
  });

  const valueFor = (key: string): number => {
    const raw = Number(settings.find((s) => s.key === key)?.value);
    return Number.isFinite(raw) && raw >= 0 ? raw : 0;
  };

  const storedThreshold = valueFor("free_shipping_threshold");
  const storedBaseFee = valueFor("shipping_fee_base");

  const provinces = await prisma.province.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      shippingCost: true,
    },
    orderBy: { name: "asc" },
  });

  return {
    freeShippingThreshold:
      storedThreshold > 0 ? storedThreshold : DEFAULT_SHIPPING_THRESHOLD,
    baseShippingFee: storedBaseFee > 0 ? storedBaseFee : DEFAULT_SHIPPING_FEE,
    provinceCount: provinces.length,
    provinces: provinces.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      slug: p.slug,
      shippingCost: Number(p.shippingCost),
    })),
  };
}

export async function GET() {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await readShippingConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("GET /api/admin/shipping-settings error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تنظیمات ارسال" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { freeShippingThreshold, baseShippingFee, provinces } = body;

    if (
      !Number.isInteger(Number(freeShippingThreshold)) ||
      Number(freeShippingThreshold) < 0
    ) {
      return NextResponse.json(
        { success: false, message: "مبلغ آستانه ارسال رایگان باید عدد معتبر باشد" },
        { status: 400 }
      );
    }

    if (
      baseShippingFee !== undefined &&
      (!Number.isInteger(Number(baseShippingFee)) || Number(baseShippingFee) < 0)
    ) {
      return NextResponse.json(
        { success: false, message: "هزینه ارسال پیش‌فرض باید عدد معتبر باشد" },
        { status: 400 }
      );
    }

    if (!Array.isArray(provinces) || provinces.length === 0) {
      return NextResponse.json(
        { success: false, message: "لیست استان‌ها نامعتبر است" },
        { status: 400 }
      );
    }

    const priceMap = new Map<string, number>();
    for (const item of provinces) {
      const id = String(item?.id ?? "").trim();
      const value = Number(item?.shippingCost);
      if (!id || !Number.isInteger(value) || value < 0) {
        return NextResponse.json(
          { success: false, message: "مبلغ ارسال استان‌ها نامعتبر است" },
          { status: 400 }
        );
      }
      priceMap.set(id, value);
    }

    await prisma.$transaction(async (tx) => {
      await tx.siteSetting.upsert({
        where: { key: "free_shipping_threshold" },
        update: {
          value: String(Number(freeShippingThreshold)),
          type: "integer",
        },
        create: {
          key: "free_shipping_threshold",
          value: String(Number(freeShippingThreshold)),
          type: "integer",
        },
      });

      if (baseShippingFee !== undefined) {
        await tx.siteSetting.upsert({
          where: { key: "shipping_fee_base" },
          update: { value: String(Number(baseShippingFee)), type: "integer" },
          create: { key: "shipping_fee_base", value: String(Number(baseShippingFee)), type: "integer" },
        });
      }

      const dbProvinces = await tx.province.findMany({
        select: { id: true },
      });

      for (const record of dbProvinces) {
        const cost = priceMap.get(record.id.toString());
        if (cost === undefined) continue;
        await tx.province.update({
          where: { id: record.id },
          data: { shippingCost: BigInt(cost) },
        });
      }
    });

    const config = await readShippingConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("PUT /api/admin/shipping-settings error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ذخیره تنظیمات ارسال" },
      { status: 500 }
    );
  }
}