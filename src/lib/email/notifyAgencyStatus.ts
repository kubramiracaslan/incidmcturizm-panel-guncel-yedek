import { sendMail } from "./send";
import { agencyApprovedEmail, agencyRejectedEmail, agencyAccountCreatedEmail } from "./templates";
import { panelUrl } from "./panelUrl";
import type { Agency } from "@/lib/types";

/** Acente onaylanınca kendisine "giriş yapabilirsiniz" maili gönderir.
 * `PANEL_BASE_URL` tanımsızsa "Giriş Yap" düğmesi hiç gösterilmez. */
export async function notifyAgencyOfApproval(agency: Agency): Promise<void> {
  if (!agency.email) return;

  const { subject, html } = agencyApprovedEmail(agency, panelUrl("/login"));
  await sendMail({ to: agency.email, subject, html, context: `acente #${agency.id} onay maili` });
}

/** Acente reddedilince kendisine kibar bir ret maili gönderir. */
export async function notifyAgencyOfRejection(agency: Agency): Promise<void> {
  if (!agency.email) return;

  const { subject, html } = agencyRejectedEmail(agency);
  await sendMail({ to: agency.email, subject, html, context: `acente #${agency.id} ret maili` });
}

/** Admin "Yeni Acente Ekle" ile bir hesap oluşturduğunda acenteye gönderilir
 * — şifreyi içermez, sadece hesabın oluştuğunu bildirir. `notifyAgencyOfApproval`/
 * `notifyAgencyOfRejection` gibi herhangi bir `notification_preferences`
 * kontrolü yok (bu ikisinde de yok — hesap onay/ret/oluşturma mailleri için
 * ayarlarda bir tercih anahtarı bulunmuyor). */
export async function notifyAgencyOfAccountCreated(input: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  if (!input.email) return;

  const { subject, html } = agencyAccountCreatedEmail(input, panelUrl("/login"));
  await sendMail({ to: input.email, subject, html, context: `acente hesabı oluşturuldu maili (${input.email})` });
}
