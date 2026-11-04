import { formatDate, formatMoney, requestStatusLabels } from "@/lib/format";
import type { Agency, RequestStatus, TeklifTalebi } from "@/lib/types";

interface EmailContent {
  subject: string;
  html: string;
}

/**
 * Tüm mail şablonlarının paylaştığı sade kurumsal renk paleti. Koyu mod/
 * mobil mail istemcilerinde de okunur kalması için bilerek düşük kontrastlı
 * degradeler değil, düz koyu/açık tonlar kullanılıyor.
 */
const COLORS = {
  pageBg: "#f3f4f6",
  cardBg: "#ffffff",
  border: "#e5e7eb",
  heading: "#111827",
  desc: "#6b7280",
  label: "#6b7280",
  value: "#111827",
  buttonBg: "#111827",
  buttonText: "#ffffff",
  footer: "#9ca3af",
} as const;

const FONT = "Arial, Helvetica, sans-serif";

interface InfoRow {
  label: string;
  value: string;
}

/**
 * Etiket (sol, sabit ~130px, soluk gri) + değer (koyu) satırları, satır
 * arası ince çizgiyle. Tablo tabanlı — flex/grid mail istemcilerinin
 * çoğunda desteklenmiyor.
 */
function infoTable(rows: InfoRow[]): string {
  const cells = rows
    .map(
      (row) => `
        <tr>
          <td style="width:130px; padding:10px 0; border-bottom:1px solid ${COLORS.border}; font-family:${FONT}; font-size:13px; color:${COLORS.label}; vertical-align:top;">${row.label}</td>
          <td style="padding:10px 0; border-bottom:1px solid ${COLORS.border}; font-family:${FONT}; font-size:14px; color:${COLORS.value}; vertical-align:top;">${row.value}</td>
        </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 0 0;">${cells}</table>`;
}

/** Koyu zemin üzerine beyaz yazı düğme. `url` boşsa (örn. `PANEL_BASE_URL`
 * tanımsız) hiç render edilmez — kırık/bağlantısız bir düğme göstermez. */
function ctaButton(label: string, url: string | null): string {
  if (!url) return "";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0 0;">
      <tr>
        <td style="border-radius:6px; background-color:${COLORS.buttonBg};">
          <a href="${url}" style="display:inline-block; padding:12px 24px; font-family:${FONT}; font-size:14px; font-weight:bold; color:${COLORS.buttonText}; text-decoration:none; border-radius:6px;">${label}</a>
        </td>
      </tr>
    </table>
  `;
}

interface EmailLayoutParams {
  heading: string;
  description: string;
  bodyHtml?: string;
  cta?: string;
}

/**
 * Tüm mail şablonlarının paylaştığı kart düzeni: açık gri sayfa zemini
 * üzerinde, en fazla 560px genişliğinde ortalanmış beyaz bir kart. Tablo
 * tabanlı yapı + satır içi (inline) CSS — mail istemcileri için flex/grid
 * yerine bu kullanılır, mail penceresine yayılmaz.
 */
function emailLayout({ heading, description, bodyHtml = "", cta = "" }: EmailLayoutParams): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.pageBg}; padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:${COLORS.cardBg}; border-radius:8px;">
        <tr>
          <td style="padding:32px 28px;">
            <h1 style="margin:0 0 8px 0; font-family:${FONT}; font-size:20px; line-height:1.3; color:${COLORS.heading};">${heading}</h1>
            <p style="margin:0; font-family:${FONT}; font-size:14px; line-height:1.5; color:${COLORS.desc};">${description}</p>
            ${bodyHtml}
            ${cta}
            <p style="margin:28px 0 0 0; padding-top:16px; border-top:1px solid ${COLORS.border}; font-family:${FONT}; font-size:12px; color:${COLORS.footer};">İnci DMC Turizm</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  `;
}

const COPY: Record<Exclude<RequestStatus, "beklemede">, { subject: string; heading: string; description: string }> = {
  onaylandi: {
    subject: "Teklif talebiniz onaylandı",
    heading: "Talebiniz onaylandı",
    description: "Teklif talebiniz onaylandı, operasyon ekibimiz turunuzu planlamaya başlayacak.",
  },
  revize_istendi: {
    subject: "Teklif talebiniz için revize isteniyor",
    heading: "Talebinizde revize gerekiyor",
    description: "Teklif talebinizde bazı noktaların gözden geçirilmesi gerekiyor.",
  },
  reddedildi: {
    subject: "Teklif talebiniz reddedildi",
    heading: "Talebiniz reddedildi",
    description: "Teklif talebiniz maalesef reddedildi.",
  },
};

/** Talep durumu değişince acenteye gönderilir. `panelRequestsUrl` boşsa
 * "Taleplerimi Görüntüle" düğmesi hiç gösterilmez. */
export function requestStatusEmail(request: TeklifTalebi, panelRequestsUrl: string | null): EmailContent {
  const copy = COPY[request.status as Exclude<RequestStatus, "beklemede">];

  const body = infoTable([
    { label: "Talep No", value: `#${request.id}` },
    { label: "Tur", value: request.tourName },
    { label: "Yeni Durum", value: requestStatusLabels[request.status] },
    { label: "Tahmini tutar", value: formatMoney(request.amount, request.currency) },
  ]);

  return {
    subject: copy.subject,
    html: emailLayout({
      heading: copy.heading,
      description: copy.description,
      bodyHtml: body,
      cta: ctaButton("Taleplerimi Görüntüle", panelRequestsUrl),
    }),
  };
}

/** Acente onaylanınca kendisine gönderilir. `panelLoginUrl` boşsa "Giriş
 * Yap" düğmesi hiç gösterilmez. */
export function agencyApprovedEmail(agency: Agency, panelLoginUrl: string | null): EmailContent {
  return {
    subject: "Acente hesabınız onaylandı",
    html: emailLayout({
      heading: "Hesabınız onaylandı",
      description: `Merhaba ${agency.contactName || agency.name}, ${agency.name} acente hesabınız onaylandı. Panele giriş yapabilirsiniz.`,
      cta: ctaButton("Giriş Yap", panelLoginUrl),
    }),
  };
}

/** Acente reddedilince kendisine gönderilir — kibar, kısa bir ret bildirimi. */
export function agencyRejectedEmail(agency: Agency): EmailContent {
  return {
    subject: "Acente başvurunuz hakkında",
    html: emailLayout({
      heading: "Başvurunuz değerlendirildi",
      description: `Merhaba ${agency.contactName || agency.name}, ${agency.name} adına yaptığınız acente başvurusunu bu aşamada onaylayamadık. Sorularınız için bizimle iletişime geçebilirsiniz.`,
    }),
  };
}

/** Yeni bir teklif talebi oluşunca adminlere gönderilir. `panelRequestsUrl`
 * boşsa "Panelde Görüntüle" düğmesi hiç gösterilmez. */
export function newRequestAdminEmail(request: TeklifTalebi, panelRequestsUrl: string | null): EmailContent {
  const rows: InfoRow[] = [
    { label: "Talep No", value: `#${request.id}` },
    { label: "Acente", value: request.agencyName },
    { label: "Tur", value: request.tourName },
    {
      label: "Kişi Sayısı",
      value: `${request.adults} yetişkin${request.children > 0 ? `, ${request.children} çocuk` : ""}`,
    },
    { label: "Planlanan Tarih", value: formatDate(request.startDate) },
  ];
  if (request.notes.trim()) {
    rows.push({ label: "Notlar", value: request.notes });
  }
  rows.push({ label: "Durum", value: "Beklemede" });

  return {
    subject: `Yeni teklif talebi: ${request.tourName}`,
    html: emailLayout({
      heading: "Yeni teklif talebi",
      description: `${request.agencyName} acentesi, ${request.tourName} için yeni bir teklif talebi oluşturdu.`,
      bodyHtml: infoTable(rows),
      cta: ctaButton("Panelde Görüntüle", panelRequestsUrl),
    }),
  };
}

interface NewAgencyAdminInput {
  acentaIsmi: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Yeni bir acente kendi kendine kayıt olunca (self-servis) adminlere
 * gönderilir. `panelAgenciesUrl` boşsa "Panelde Onayla" düğmesi hiç
 * gösterilmez. */
export function newAgencyAdminEmail(input: NewAgencyAdminInput, panelAgenciesUrl: string | null): EmailContent {
  const rows: InfoRow[] = [
    { label: "Acenta Adı", value: input.acentaIsmi },
    { label: "Yetkili Adı", value: `${input.firstName} ${input.lastName}` },
    { label: "E-posta", value: input.email },
    { label: "Telefon", value: input.phone },
  ];

  return {
    subject: `Yeni acente kaydı: ${input.acentaIsmi}`,
    html: emailLayout({
      heading: "Yeni acente kaydı",
      description: `${input.acentaIsmi} panele kayıt oldu ve onayınızı bekliyor.`,
      bodyHtml: infoTable(rows),
      cta: ctaButton("Panelde Onayla", panelAgenciesUrl),
    }),
  };
}
