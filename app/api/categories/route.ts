import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/storefront";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    );
  }
}
