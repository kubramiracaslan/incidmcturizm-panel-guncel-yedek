import { sendMail } from "./send";
import { newRequestAdminEmail, newAgencyAdminEmail } from "./templates";
import { panelUrl } from "./panelUrl";
import type { TeklifTalebi } from "@/lib/types";

/** `ADMIN_NOTIFICATION_EMAILS` — virgülle ayrılmış adres listesi. Kodda
 * sabit bir e-posta adresi yazılmaz; liste tanımsız/boşsa gönderim atlanır. */
function adminRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

/** Yeni bir teklif talebi oluşunca adminlere gönderilir. */
export async function notifyAdminsOfNewRequest(request: TeklifTalebi): Promise<void> {
  const recipients = adminRecipients();
  if (recipients.length === 0) {
    console.error(`[mail] ADMIN_NOTIFICATION_EMAILS tanımlı değil, talep #${request.id} bildirimi atlandı.`);
    return;
  }

  const { subject, html } = newRequestAdminEmail(request, panelUrl("/admin/talepler"));
  await sendMail({ to: recipients, subject, html, context: `talep #${request.id} yeni talep bildirimi` });
}

interface NewAgencyNotificationInput {
  acentaIsmi: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Yeni bir acente kendi kendine kayıt olunca (self-servis) adminlere gönderilir. */
export async function notifyAdminsOfNewAgency(input: NewAgencyNotificationInput): Promise<void> {
  const recipients = adminRecipients();
  if (recipients.length === 0) {
    console.error(`[mail] ADMIN_NOTIFICATION_EMAILS tanımlı değil, yeni acente (${input.email}) bildirimi atlandı.`);
    return;
  }

  const { subject, html } = newAgencyAdminEmail(input, panelUrl("/admin/acente-yonetimi"));
  await sendMail({ to: recipients, subject, html, context: `yeni acente kaydı (${input.email}) bildirimi` });
}
