import { NextResponse } from "next/server";
import { getAllBrands } from "@/lib/storefront";

export async function GET() {
  try {
    const brands = await getAllBrands();
    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error("GET /api/brands error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت برندها" },
      { status: 500 }
    );
  }
}
