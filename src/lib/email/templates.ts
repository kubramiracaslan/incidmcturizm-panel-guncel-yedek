import { formatDate, formatMoney, requestStatusLabels } from "@/lib/format";
import { panelUrl } from "./panelUrl";
import type { Agency, RequestStatus, TeklifTalebi } from "@/lib/types";

interface EmailContent {
  subject: string;
  html: string;
}

/**
 * Panelin kendi renk paletinden (src/app/globals.css) birebir alınan hex
 * değerleri — mail, panelin kurumsal kimliğiyle tutarlı olsun diye.
 *   - headerBg / headerText: --color-background / --color-on-background
 *     (panelin koyu arka planı ve üzerindeki yazı rengi).
 *   - buttonBg: --color-brand (DESIGN.md: "Primary: Filled with #10B981",
 *     panelin kendi dolgulu butonlarında kullanılan vurgu yeşili).
 *   - buttonText: --color-primary-container — panelin `bg-brand` butonları
 *     da metin rengi olarak bunu kullanıyor (bkz. RequestForm.tsx'teki
 *     "Teklif Talebi Oluştur" butonu: `bg-brand text-primary-container`).
 * Kart içi (beyaz zemin) renkleri panelin kendi koyu temasında karşılığı
 * olmadığı için (panel tek temalı/koyu), okunabilir sade nötr tonlarla
 * tamamlanıyor.
 */
const COLORS = {
  pageBg: "#f3f4f6",
  headerBg: "#071708",
  headerText: "#d4e8cf",
  cardBg: "#ffffff",
  border: "#e5e7eb",
  heading: "#111827",
  desc: "#6b7280",
  label: "#6b7280",
  value: "#111827",
  linkText: "#4b5563",
  buttonBg: "#10b981",
  buttonText: "#002d24",
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

/** E-posta/telefon değerlerini kendi `mailto:`/`tel:` bağlantımızla
 * sarıyor — aksi halde Gmail/Outlook gibi istemciler düz metindeki
 * e-posta/telefonu kendi varsayılan mavi-altı-çizili linkine çeviriyor. */
function contactLink(href: string, text: string): string {
  return `<a href="${href}" style="color:${COLORS.linkText} !important; text-decoration:none;">${text}</a>`;
}

/**
 * Vurgu yeşili zeminde düğme — tablo tabanlı, `bgcolor` özniteliğiyle
 * (Outlook masaüstü `background-color`'ı değil bunu okur). `url` boşsa
 * (örn. `PANEL_BASE_URL` tanımsız) hiç render edilmez — kırık/bağlantısız
 * bir düğme göstermez. Bilgi tablosunun altında, ortalanmış, üstünde 24px
 * boşlukla durur — dış tablo tam genişlikte, `align="center"` olan hücresi
 * içindeki iç tablo düğmenin kendi genişliğinde kalır (mail istemcilerinde
 * ortalamanın standart yolu).
 */
function ctaButton(label: string, url: string | null): string {
  if (!url) return "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td bgcolor="${COLORS.buttonBg}" style="border-radius:6px; background-color:${COLORS.buttonBg};">
                <a href="${url}" style="color:${COLORS.buttonText} !important; text-decoration:none; font-weight:bold; font-size:15px; padding:12px 24px; display:inline-block; font-family:${FONT};">${label}</a>
              </td>
            </tr>
          </table>
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
 * Tüm mail şablonlarının paylaştığı düzen: üstte panelin koyu arka plan
 * renginde bir başlık şeridi (logo + "İNCİ DMC TURİZM" metni), altında en
 * fazla 560px genişliğinde beyaz bir içerik kartı. Tablo tabanlı yapı +
 * satır içi (inline) CSS — mail istemcileri için flex/grid yerine bu
 * kullanılır, mail penceresine yayılmaz. Logo `PANEL_BASE_URL` + `/logo2.png`
 * üzerinden mutlak bir URL'e ihtiyaç duyar (mail istemcileri yerel dosya
 * yolunu gösteremez); bu değişken tanımsızsa logo hiç render edilmez,
 * sadece metin kalır.
 */
function emailLayout({ heading, description, bodyHtml = "", cta = "" }: EmailLayoutParams): string {
  const logoSrc = panelUrl("/logo2.png");
  const logoImg = logoSrc
    ? `<td style="padding-right:10px; vertical-align:middle;"><img src="${logoSrc}" width="42" height="28" alt="İnci DMC Turizm" style="display:block; border:0;"></td>`
    : "";

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.pageBg}; padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td bgcolor="${COLORS.headerBg}" style="background-color:${COLORS.headerBg}; padding:16px 28px; border-radius:8px 8px 0 0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                ${logoImg}
                <td style="font-family:${FONT}; font-size:14px; font-weight:bold; letter-spacing:1px; color:${COLORS.headerText}; vertical-align:middle;">İNCİ DMC TURİZM</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td bgcolor="${COLORS.cardBg}" style="background-color:${COLORS.cardBg}; padding:32px 28px; border-radius:0 0 8px 8px;">
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
 * gösterilmez. E-posta/telefon değerleri `contactLink` ile kendi
 * stilimizde bağlantıya çevrilir ki istemcinin varsayılan mavi-altı-çizili
 * otomatik linkine dönüşmesin. */
export function newAgencyAdminEmail(input: NewAgencyAdminInput, panelAgenciesUrl: string | null): EmailContent {
  const rows: InfoRow[] = [
    { label: "Acenta Adı", value: input.acentaIsmi },
    { label: "Yetkili Adı", value: `${input.firstName} ${input.lastName}` },
    { label: "E-posta", value: contactLink(`mailto:${input.email}`, input.email) },
    { label: "Telefon", value: contactLink(`tel:${input.phone}`, input.phone) },
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
