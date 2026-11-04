import { sendMail } from "./send";
import { requestStatusEmail } from "./templates";
import { panelUrl } from "./panelUrl";
import { getNotificationPreferences } from "@/lib/notifications/preferences";
import type { TeklifTalebi } from "@/lib/types";

/**
 * Talep durumu değişince acenteye mail gönderir — acente bunu kendi
 * `/agent/ayarlar` sayfasındaki "Talep durumu e-postaları" anahtarıyla
 * kapatabilir (`notification_preferences.talep_durumu_epostalari`); kapalıysa
 * hiç gönderilmez. `agencyUserId`, `acentalar.user_id` — tercihler bu
 * kullanıcı kaydına bağlı.
 */
export async function notifyAgencyOfRequestStatus(
  request: TeklifTalebi,
  agencyEmail: string,
  agencyUserId: string,
): Promise<void> {
  if (request.status === "beklemede" || !agencyEmail) return;

  const preferences = await getNotificationPreferences(agencyUserId, "agent");
  if (!preferences.talep_durumu_epostalari) return;

  const { subject, html } = requestStatusEmail(request, panelUrl("/agent/talepler"));
  await sendMail({ to: agencyEmail, subject, html, context: `talep #${request.id} durum maili` });
}
