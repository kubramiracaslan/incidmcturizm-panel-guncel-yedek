import { NextResponse, type NextRequest } from "next/server";
import { findMockUserById } from "@/lib/auth/mock-users";
import { SESSION_COOKIE_NAME, decodeSessionToken } from "@/lib/auth/session-token";

function dashboardPathFor(role: "agent" | "admin"): string {
  return role === "admin" ? "/admin/dashboard" : "/agent/dashboard";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = decodeSessionToken(token);
  const user = payload ? findMockUserById(payload.uid) : null;

  const isAgentRoute = pathname.startsWith("/agent");
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/login";

  if (!user) {
    if (isAgentRoute || isAdminRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Signed in: keep each role inside its own panel and out of /login.
  if (isLoginRoute || pathname === "/") {
    return NextResponse.redirect(new URL(dashboardPathFor(user.role), request.url));
  }
  if (isAdminRoute && user.role !== "admin") {
    return NextResponse.redirect(new URL(dashboardPathFor(user.role), request.url));
  }
  if (isAgentRoute && user.role !== "agent") {
    return NextResponse.redirect(new URL(dashboardPathFor(user.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/agent/:path*", "/admin/:path*"],
};
