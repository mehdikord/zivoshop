import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/storefront";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت محصول" },
      { status: 500 }
    );
  }
}
