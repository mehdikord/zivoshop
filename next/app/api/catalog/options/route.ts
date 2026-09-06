import { NextResponse } from "next/server";
import { getCatalogOptions } from "@/lib/catalog-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;

    const facets = await getCatalogOptions(categoryId);

    return NextResponse.json({
      success: true,
      data: facets,
    });
  } catch (error) {
    console.error("Catalog options error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}