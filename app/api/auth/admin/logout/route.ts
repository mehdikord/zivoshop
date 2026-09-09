import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-response";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function POST() {
  const admin = await verifyAdminToken();
  if (admin) {
    logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.AUTH_LOGOUT, ipAddress: extractIp(), userAgent: extractUserAgent() });
  }
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  return apiSuccess(null);
}
