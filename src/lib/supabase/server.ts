import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Per-request Supabase client for anything that needs the visitor's auth
 * session (sign-in, sign-out, reading the current user) — Server
 * Components, Server Actions, Route Handlers. Distinct from
 * `lib/supabase/client.ts`, which is a plain anon client used for
 * unauthenticated reads (tours, blog posts) and never touches cookies.
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component render, where `cookies()` is
          // read-only. Safe to ignore: the session is still valid for this
          // request and will be refreshed on the next Server Action / Route
          // Handler call, which can write cookies.
        }
      },
    },
  });
}
