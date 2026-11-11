import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing point for Supabase's password-recovery email link
 * (`resetPasswordForEmail`'s `redirectTo`, set in
 * `requestPasswordResetAction`). Supabase's PKCE flow appends a `code`
 * query param here — exchanging it is what actually establishes the
 * recovery session (cookies), which `/sifre-yenile` then needs to call
 * `auth.updateUser({ password })`.
 *
 * Always redirects to `/sifre-yenile` whether the exchange succeeds or
 * not: on failure (expired/already-used/missing code), no session cookie
 * gets set, and `/sifre-yenile` already treats "no session" as the
 * expired-link case — so there is no separate error state to carry here.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectUrl = new URL("/sifre-yenile", request.url);
  return NextResponse.redirect(redirectUrl);
}
