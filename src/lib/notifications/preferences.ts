import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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
//
// service_role ile okunuyor (session ile değil): bu fonksiyon sadece
// kendi tercihini okuyan kullanıcı için değil, admin bir talebin durumunu
// değiştirirken BAŞKA bir kullanıcının (acentenin) tercihini okumak için de
// çağrılıyor (bkz. notifyRequestStatus.ts). notification_preferences'ın RLS
// policy'si "auth.uid() = user_id" olduğundan, admin'in kendi session'ıyla
// acentenin satırını sorgulamak RLS tarafından sessizce 0 satıra düşürülür
// (hata fırlamaz) — kod bunu "tercih hiç ayarlanmamış" ile aynı sayıp
// yanlışlıkla varsayılana döner. service_role bu filtrelemeyi atlar; hangi
// `userId` için okunduğu zaten `.eq("user_id", userId)` ile sabitlendiğinden
// bir güvenlik kaybı yok — sadece RLS'in rolü burada "başka bir kullanıcı
// adına okuma" senaryosunda yanlış taraf.
export async function getNotificationPreferences(
  userId: string,
  role: UserRole,
): Promise<Record<string, boolean>> {
  const preferences = { ...defaultsForRole(role) };

  const client = await createSupabaseAdminClient();
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
