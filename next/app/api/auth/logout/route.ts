import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    cookieStore.delete("zivo_user_token");
    cookieStore.delete("zivo_admin_token");

    return NextResponse.json({ success: true, message: "با موفقیت خارج شدید" });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}