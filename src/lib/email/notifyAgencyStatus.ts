import { sendMail } from "./send";
import { agencyApprovedEmail, agencyRejectedEmail } from "./templates";
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
