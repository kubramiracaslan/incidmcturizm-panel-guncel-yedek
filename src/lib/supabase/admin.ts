import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely. Server-only. The
 * live project only grants write access on `tours`/`blog_posts`/
 * `logo_settings`/`hero_settings`/`featured_section_settings`/`services`/
 * `stats`/`partners` to `service_role`, so every admin content-write method
 * in `supabase-repository.ts` (tur/blog/ana sayfa CRUD) uses this client —
 * the admin-only check happens in the calling Server Action
 * (`*-actions.ts`), not via RLS, before `repository.*` is ever reached.
 * Also used by `createAgencyAction` (needs `auth.admin.createUser()`) and
 * `retryPendingRequests` (`lib/integrations/omSync.ts`, authenticates via a
 * bearer secret instead of a session). Never import this from a client
 * component. Talep/acente read-write paths that stay RLS-scoped to the
 * caller's own session still use `lib/supabase/server.ts`.
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
