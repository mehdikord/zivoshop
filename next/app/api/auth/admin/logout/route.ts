import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  return apiSuccess(null);
}
