import { resendClient } from "./resend";
import { requestStatusEmail } from "./templates";
import type { TeklifTalebi } from "@/lib/types";

export async function notifyAgencyOfRequestStatus(
  request: TeklifTalebi,
  agencyEmail: string,
): Promise<void> {
  if (request.status === "beklemede" || !agencyEmail) return;

  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    console.error(`[notifyAgencyOfRequestStatus] RESEND_FROM_EMAIL tanımlı değil, ${request.id} için e-posta atlandı.`);
    return;
  }

  try {
    const { subject, html } = requestStatusEmail(request);
    await resendClient().emails.send({ from, to: agencyEmail, subject, html });
  } catch (error) {
    console.error(`[notifyAgencyOfRequestStatus] ${request.id} için e-posta gönderilemedi:`, error);
  }
}
