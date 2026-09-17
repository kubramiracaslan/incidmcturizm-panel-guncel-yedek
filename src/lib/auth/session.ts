import type { SupabaseClient, User as SupabaseAuthUser } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthUser, UserRole } from "@/lib/types";

/** Deterministic "initials on a colored circle" avatar, so we never need a
 * network call (or a made-up external URL) just to render a placeholder. */
function initialsAvatarDataUri(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
    <rect width="64" height="64" rx="32" fill="#0c372d"/>
    <text x="32" y="32" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#a5cfc2">${initials}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** An agent's own row in `acentalar`, looked up by `user_id` (RLS scopes
 * SELECT to `user_id = auth.uid()`, so this only ever returns the caller's
 * own agency — never another agent's). */
async function loadAgencyProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ id: string; name: string; status: string } | null> {
  const { data, error } = await supabase
    .from("acentalar")
    .select("id, acenta_ismi, status")
    .eq("user_id", userId)
    .maybeSingle();
  // Log rather than swallow: a permission/RLS misconfiguration should show
  // up as a loud server error, not silently read as "no agency for this
  // user" (which would incorrectly lock a legitimate agent out).
  if (error) {
    console.error("[loadAgencyProfile] Supabase error for user_id=%s:", userId, error);
  }
  return data ? { id: data.id, name: data.acenta_ismi, status: data.status } : null;
}

export type AuthResolutionFailureReason = "no-role" | "no-agency" | "pending" | "rejected";

export type AuthResolution =
  | { user: AuthUser; reason?: undefined }
  | { user: null; reason: AuthResolutionFailureReason };

/**
 * Maps a Supabase Auth user to this app's `AuthUser`. The role lives in
 * `app_metadata.role` (set via SQL/Dashboard — never writable by the user
 * themselves, unlike `user_metadata`).
 *
 * `user` is null — meaning "not a usable session" — when: the account has
 * no recognized role ("no-role"), it's an agent with no matching
 * `acentalar` row ("no-agency"), or that row exists but hasn't been
 * approved yet ("pending"/"rejected"). `reason` lets `loginAction` show the
 * right message; `getSession()` only cares whether `user` is null. Because
 * both resolve through this same function, an agent whose approval is
 * revoked later is treated as signed out everywhere, not just blocked at
 * the login form.
 */
export async function resolveAuthUser(
  supabase: SupabaseClient,
  supabaseUser: SupabaseAuthUser,
): Promise<AuthResolution> {
  const role = supabaseUser.app_metadata?.role;
  if (role !== "admin" && role !== "agent") return { user: null, reason: "no-role" };

  const name =
    (supabaseUser.user_metadata?.full_name as string | undefined) ||
    supabaseUser.email ||
    "Kullanıcı";
  const avatarUrl =
    (supabaseUser.user_metadata?.avatar_url as string | undefined) ||
    initialsAvatarDataUri(name);

  if (role === "admin") {
    return {
      user: {
        id: supabaseUser.id,
        name,
        email: supabaseUser.email ?? "",
        role: "admin",
        agencyId: null,
        agencyName: null,
        avatarUrl,
      },
    };
  }

  const agency = await loadAgencyProfile(supabase, supabaseUser.id);
  if (!agency) return { user: null, reason: "no-agency" };
  if (agency.status === "pending") return { user: null, reason: "pending" };
  if (agency.status === "rejected") return { user: null, reason: "rejected" };

  return {
    user: {
      id: supabaseUser.id,
      name,
      email: supabaseUser.email ?? "",
      role: "agent" as UserRole,
      agencyId: agency.id,
      agencyName: agency.name,
      avatarUrl,
    },
  };
}

/** Reads the current Supabase Auth session and resolves it to a user, or null. */
export async function getSession(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const resolution = await resolveAuthUser(supabase, data.user);
  return resolution.user;
}
