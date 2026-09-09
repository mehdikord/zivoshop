import { NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/auth";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function POST() {
  try {
    const user = await verifyUserToken();
    if (user) {
      logActivity({ userType: "user", userId: user.id, action: ActivityActions.AUTH_LOGOUT, ipAddress: extractIp(), userAgent: extractUserAgent() });
    }
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