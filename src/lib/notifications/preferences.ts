import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export const ADMIN_PREFERENCE_DEFAULTS: Record<string, boolean> = {
  yeni_talep_epostalari: true,
  yeni_acente_kayitlari: true,
  haftalik_ozet_raporu: false,
};

export const AGENT_PREFERENCE_DEFAULTS: Record<string, boolean> = {
  talep_durumu_epostalari: true,
  yeni_tur_duyurulari: true,
};

function defaultsForRole(role: UserRole): Record<string, boolean> {
  return role === "admin" ? ADMIN_PREFERENCE_DEFAULTS : AGENT_PREFERENCE_DEFAULTS;
}

export function allowedPreferenceKeys(role: UserRole): string[] {
  return Object.keys(defaultsForRole(role));
}

// Tablo yoksa veya sorgu hata verirse varsayılanlarla devam eder.
export async function getNotificationPreferences(
  userId: string,
  role: UserRole,
): Promise<Record<string, boolean>> {
  const preferences = { ...defaultsForRole(role) };

  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from("notification_preferences")
    .select("pref_key, enabled")
    .eq("user_id", userId);

  if (error) {
    console.error(
      "[getNotificationPreferences] Supabase error for user_id=%s:",
      userId,
      error,
    );
    return preferences;
  }

  for (const row of data ?? []) {
    if (Object.hasOwn(preferences, row.pref_key)) {
      preferences[row.pref_key] = row.enabled;
    }
  }

  return preferences;
}
