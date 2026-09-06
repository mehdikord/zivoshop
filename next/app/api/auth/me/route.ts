import { NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/auth";

export async function GET() {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: payload.id,
          name: payload.name,
          mobile: payload.mobile,
          email: payload.email,
        },
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}