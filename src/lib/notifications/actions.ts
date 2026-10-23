"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { allowedPreferenceKeys } from "@/lib/notifications/preferences";

export interface UpdateNotificationPreferenceResult {
  error: string | null;
}

export async function updateNotificationPreferenceAction(
  key: string,
  value: boolean,
): Promise<UpdateNotificationPreferenceResult> {
  const user = await getSession();
  if (!user) {
    return { error: "Oturum bulunamadı." };
  }

  // Server Action tarayıcıdan da çağrılabilir; TS tipi garanti değil, çalışma zamanında doğrulanıyor.
  if (!allowedPreferenceKeys(user.role).includes(key)) {
    return { error: "Geçersiz tercih anahtarı." };
  }
  if (typeof value !== "boolean") {
    return { error: "Geçersiz değer." };
  }

  const client = await createSupabaseServerClient();
  const { error } = await client.from("notification_preferences").upsert(
    {
      user_id: user.id,
      pref_key: key,
      enabled: value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,pref_key" },
  );

  if (error) {
    console.error(
      "[updateNotificationPreferenceAction] Supabase error for user_id=%s, key=%s:",
      user.id,
      key,
      error,
    );
    return { error: "Tercih kaydedilirken bir hata oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath(user.role === "admin" ? "/admin/ayarlar" : "/agent/ayarlar");
  return { error: null };
}
