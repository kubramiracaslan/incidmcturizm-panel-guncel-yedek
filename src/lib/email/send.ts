import { resendClient } from "./resend";

interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  /** Log satırlarında hangi bildirimin başarısız olduğunu ayırt etmek için
   * (örn. "talep #123 durum maili", "yeni acente kaydı maili"). */
  context: string;
}

/**
 * Tüm mail gönderimlerinin tek giriş noktası. Gönderici adres `MAIL_FROM`
 * ortam değişkeninden okunur. Bu fonksiyon hiçbir zaman fırlatmaz — eksik
 * `MAIL_FROM` veya Resend hatası sadece loglanır — çağıran taraf (talep/
 * acente/admin aksiyonları) mail başarısız olsa da kendi işlemini tamamlar.
 */
export async function sendMail({ to, subject, html, context }: SendMailParams): Promise<void> {
  const from = process.env.MAIL_FROM;
  if (!from) {
    console.error(`[mail] MAIL_FROM tanımlı değil, ${context} atlandı.`);
    return;
  }

  try {
    await resendClient().emails.send({ from, to, subject, html });
  } catch (error) {
    console.error(`[mail] ${context} gönderilemedi:`, error);
  }
}
