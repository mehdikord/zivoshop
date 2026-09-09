import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/storefront";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ success: false, message: "محصول یافت نشد" }, { status: 404 });
  }

  const related = await getRelatedProducts(product, 8);
  return NextResponse.json({ success: true, data: related });
}