import { NextRequest, NextResponse } from "next/server";
import { getAllBanners } from "@/lib/storefront";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position") ?? undefined;

    let banners = await getAllBanners();

    if (position) {
      banners = banners.filter((b) => b.position === position);
    }

    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error("GET /api/banners error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت بنرها" },
      { status: 500 }
    );
  }
}
