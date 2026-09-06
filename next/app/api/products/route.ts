import { NextRequest, NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/storefront";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const sort = searchParams.get("sort") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "12")));
    const category = searchParams.get("category") ?? undefined;
    const brands = searchParams.get("brands")?.split(",").filter(Boolean) ?? undefined;
    const sizes = searchParams.get("sizes")?.split(",").filter(Boolean) ?? undefined;
    const colors = searchParams.get("colors")?.split(",").filter(Boolean) ?? undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const onSale = searchParams.get("onSale") === "true" ? true : undefined;
    const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
    const keyword = searchParams.get("keyword") ?? undefined;

    const result = await getCatalogProducts({
      sort,
      page,
      pageSize,
      category,
      brands,
      sizes,
      colors,
      minPrice,
      maxPrice,
      onSale,
      minRating,
      keyword,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت محصولات" },
      { status: 500 }
    );
  }
}
