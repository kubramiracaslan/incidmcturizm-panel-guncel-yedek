import { formatDate, formatMoney } from "@/lib/format";
import type { RequestStatus, TeklifTalebi } from "@/lib/types";

interface RequestStatusEmail {
  subject: string;
  html: string;
}

const COPY: Record<Exclude<RequestStatus, "beklemede">, { subject: string; heading: string; body: (r: TeklifTalebi) => string }> = {
  onaylandi: {
    subject: "Teklif talebiniz onaylandı",
    heading: "Talebiniz onaylandı",
    body: (r) =>
      `${r.tourName} turu için gönderdiğiniz ${r.id} numaralı teklif talebi onaylandı. Operasyon ekibimiz turunuzu planlamaya başlayacak, gerekli durumlarda sizinle tekrar iletişime geçilecektir.`,
  },
  revize_istendi: {
    subject: "Teklif talebiniz için revize isteniyor",
    heading: "Talebinizde revize gerekiyor",
    body: (r) =>
      `${r.tourName} turu için gönderdiğiniz ${r.id} numaralı teklif talebinde bazı noktaların gözden geçirilmesi gerekiyor. Lütfen talebi panel üzerinden kontrol edip güncelleyin.`,
  },
  reddedildi: {
    subject: "Teklif talebiniz reddedildi",
    heading: "Talebiniz reddedildi",
    body: (r) =>
      `${r.tourName} turu için gönderdiğiniz ${r.id} numaralı teklif talebi maalesef reddedildi. Detaylar için panel üzerinden talebi inceleyebilirsiniz.`,
  },
};

export function requestStatusEmail(request: TeklifTalebi): RequestStatusEmail {
  const copy = COPY[request.status as Exclude<RequestStatus, "beklemede">];

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f1f1f;">
      <h2 style="margin-bottom: 8px;">${copy.heading}</h2>
      <p style="line-height: 1.6;">${copy.body(request)}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
        <tbody>
          <tr><td style="padding: 4px 0; color: #666;">Talep No</td><td style="padding: 4px 0; text-align: right;">${request.id}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Tur</td><td style="padding: 4px 0; text-align: right;">${request.tourName}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Başlangıç Tarihi</td><td style="padding: 4px 0; text-align: right;">${formatDate(request.startDate)}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Kişi Sayısı</td><td style="padding: 4px 0; text-align: right;">${request.adults} yetişkin${request.children > 0 ? `, ${request.children} çocuk` : ""}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Tutar</td><td style="padding: 4px 0; text-align: right;">${formatMoney(request.amount, request.currency)}</td></tr>
        </tbody>
      </table>
      <p style="margin-top: 24px; color: #666; font-size: 13px;">İnci DMC Turizm</p>
    </div>
  `;

  return { subject: copy.subject, html };
}
