import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely. Server-only, and
 * only for callers with no admin cookie session to scope RLS against:
 * `createAgencyAction` (admin's manual "Yeni Acente Ekle" flow, needs
 * `auth.admin.createUser()`) and `retryPendingRequests`
 * (`lib/integrations/omSync.ts`, called from the `/api/cron/om-sync` route,
 * which authenticates via a bearer secret instead of a session). Never
 * import this from a client component; every other write in this app goes
 * through the caller's own RLS-scoped session (see `lib/supabase/server.ts`).
 */
export async function createSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
