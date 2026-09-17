import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthUser } from "@/lib/auth/session";
import { createSupabaseProxyClient } from "@/lib/supabase/proxy";

function dashboardPathFor(role: "agent" | "admin"): string {
  return role === "admin" ? "/admin/dashboard" : "/agent/dashboard";
}

/** Redirects while preserving any session cookie Supabase refreshed on `source`. */
function redirectWithCookies(url: URL, source: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { supabase, getResponse } = createSupabaseProxyClient(request);
  const { data } = await supabase.auth.getUser();
  const resolution = data.user ? await resolveAuthUser(supabase, data.user) : null;
  const user = resolution?.user ?? null;
  const response = getResponse();

  const isAgentRoute = pathname.startsWith("/agent");
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/login";

  if (!user) {
    if (isAgentRoute || isAdminRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return redirectWithCookies(loginUrl, response);
    }
    if (pathname === "/") {
      return redirectWithCookies(new URL("/login", request.url), response);
    }
    return response;
  }

  // Signed in: keep each role inside its own panel and out of /login.
  if (isLoginRoute || pathname === "/") {
    return redirectWithCookies(new URL(dashboardPathFor(user.role), request.url), response);
  }
  if (isAdminRoute && user.role !== "admin") {
    return redirectWithCookies(new URL(dashboardPathFor(user.role), request.url), response);
  }
  if (isAgentRoute && user.role !== "agent") {
    return redirectWithCookies(new URL(dashboardPathFor(user.role), request.url), response);
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/agent/:path*", "/admin/:path*"],
};
