import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely. Server-only, and
 * scoped to a single caller: `createAgencyAction` (admin's manual "Yeni
 * Acente Ekle" flow), which needs `auth.admin.createUser()`. Never import
 * this from a client component, and never use it for anything else — every
 * other write in this app goes through the caller's own RLS-scoped session
 * (see `lib/supabase/server.ts`).
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
