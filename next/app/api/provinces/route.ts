import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      include: { cities: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: provinces.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        slug: p.slug,
        cities: p.cities.map((c) => ({
          id: c.id.toString(),
          name: c.name,
          slug: c.slug,
        })),
      })),
    });
  } catch (error) {
    console.error("GET /api/provinces error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت استان‌ها" },
      { status: 500 }
    );
  }
}
