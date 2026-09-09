import { NextRequest, NextResponse } from "next/server";
import { getCatalogFacets } from "@/lib/storefront";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;

    const facets = await getCatalogFacets(category);

    return NextResponse.json({ success: true, data: facets });
  } catch (error) {
    console.error("GET /api/catalog-options error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت گزینه‌های فیلتر" },
      { status: 500 }
    );
  }
}
