import { NextResponse } from "next/server";
import { getAllFeatures } from "@/lib/storefront";

export async function GET() {
  try {
    const features = await getAllFeatures();
    return NextResponse.json({ success: true, data: features });
  } catch (error) {
    console.error("GET /api/features error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت ویژگی‌ها" },
      { status: 500 }
    );
  }
}
