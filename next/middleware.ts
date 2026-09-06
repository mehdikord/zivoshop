import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminApiPaths = ["/api/auth/admin/login", "/api/auth/admin/logout"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Mark admin routes for the layout
  if (pathname.startsWith("/admin")) {
    response.headers.set("x-route-type", "admin");
  }

  // Protect admin pages
  if (pathname.startsWith("/admin")) {
    // Allow login page
    if (pathname === "/admin/login") {
      const token = request.cookies.get("zivo_admin_token")?.value;
      if (token) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }

    // Check token for all other admin routes
    const token = request.cookies.get("zivo_admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect admin API routes (except login/logout)
  if (
    pathname.startsWith("/api/admin") &&
    !adminApiPaths.includes(pathname)
  ) {
    const token = request.cookies.get("zivo_admin_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
