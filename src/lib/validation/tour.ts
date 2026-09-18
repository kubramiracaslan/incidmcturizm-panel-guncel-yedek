/**
 * Pure, isomorphic validation + helpers for the "Yeni Tur Ekle" form's
 * general-info section — no server-only imports, safe to bundle into a
 * client component. Both the form (client, UX-only feedback) and the
 * create-tour Server Action (server, authoritative) call the same
 * function so the rules can never drift apart.
 */

export interface TourGeneralInput {
  title: string;
  slug: string;
  region: string;
  duration: string;
  basePrice: string;
  shortDescription: string;
  longDescription: string;
}

export type TourGeneralFieldErrors = Partial<Record<keyof TourGeneralInput, string>>;

export type TourGeneralValidationResult =
  | { valid: true; fieldErrors: TourGeneralFieldErrors }
  | { valid: false; fieldErrors: TourGeneralFieldErrors };

export function validateTourGeneralInput(input: TourGeneralInput): TourGeneralValidationResult {
  const fieldErrors: TourGeneralFieldErrors = {};

  if (!input.title.trim()) fieldErrors.title = "Tur başlığı boş bırakılamaz.";
  if (!input.slug.trim()) fieldErrors.slug = "URL slug boş bırakılamaz.";
  if (!input.region.trim()) fieldErrors.region = "Bölge boş bırakılamaz.";
  if (!input.duration.trim()) fieldErrors.duration = "Süre boş bırakılamaz.";

  const price = Number(input.basePrice);
  if (!input.basePrice.trim() || Number.isNaN(price) || price <= 0) {
    fieldErrors.basePrice = "Geçerli bir başlangıç fiyatı girin.";
  }

  if (!input.shortDescription.trim()) fieldErrors.shortDescription = "Kısa açıklama boş bırakılamaz.";
  if (!input.longDescription.trim()) fieldErrors.longDescription = "Detaylı açıklama boş bırakılamaz.";

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, fieldErrors: {} };
}

/** Turkish-aware slugify — mirrors the old admin panel's own logic exactly. */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
