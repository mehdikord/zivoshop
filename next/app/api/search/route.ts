import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/storefront";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "6")));

    const products = await searchProducts(q, limit);

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در جستجو" },
      { status: 500 }
    );
  }
}
