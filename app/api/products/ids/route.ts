import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapProduct } from "@/lib/storefront";

const productInclude = {
  category: { select: { id: true, name: true, slug: true, image: true } },
  brand: { select: { id: true, name: true, slug: true, logo: true } },
  images: { select: { path: true, sortOrder: true }, orderBy: { sortOrder: "asc" as const } },
  videos: { select: { url: true } },
  productColors: { select: { color: { select: { id: true, name: true, hex: true } }, image: true }, orderBy: { color: { name: "asc" as const } } },
  productSizes: { select: { size: { select: { id: true, name: true } }, stock: true, isActive: true }, orderBy: { size: { sortOrder: "asc" as const } } },
  reviews: {
    include: {
      user: { select: { name: true } },
      images: { select: { path: true } },
    },
    orderBy: { createdAt: "desc" as const },
    take: 20,
  },
  details: { select: { type: true, content: true, src: true, alt: true, sortOrder: true }, orderBy: { sortOrder: "asc" as const } },
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "شناسه‌های محصول الزامی هستند" },
        { status: 400 }
      );
    }

    if (ids.length > 50) {
      return NextResponse.json(
        { success: false, message: "حداکثر ۵۰ محصول در هر درخواست" },
        { status: 400 }
      );
    }

    const bigintIds = ids.map((id) => BigInt(id));
    const products = await prisma.product.findMany({
      where: { id: { in: bigintIds }, status: "active" },
      include: productInclude,
    });

    const mapped = await Promise.all(products.map(mapProduct));

    // Preserve original order of requested ids
    const idToProduct = new Map(mapped.map((p) => [p.id, p]));
    const ordered = ids.map((id) => idToProduct.get(id)).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: ordered,
    });
  } catch (error) {
    console.error("POST /api/products/ids error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت محصولات" },
      { status: 500 }
    );
  }
}