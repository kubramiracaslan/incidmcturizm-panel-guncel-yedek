/**
 * Pure, isomorphic validation for the "Ana Sayfa Yönetimi" forms — no
 * server-only imports, safe to bundle into a client component. Both the
 * edit/create buttons (client, UX-only feedback) and the matching server
 * actions in `home-actions.ts` (server, authoritative) call these same
 * functions so the rules can never drift apart between the two.
 */

export interface HeroInput {
  title: string;
  subtitle: string;
}

export type HeroFieldErrors = Partial<Record<keyof HeroInput, string>>;

export type HeroValidationResult =
  | { valid: true; value: HeroInput; fieldErrors: HeroFieldErrors }
  | { valid: false; fieldErrors: HeroFieldErrors };

export function validateHeroInput(input: HeroInput): HeroValidationResult {
  const value: HeroInput = {
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
  };

  const fieldErrors: HeroFieldErrors = {};
  if (!value.title) fieldErrors.title = "Başlık boş bırakılamaz.";
  if (!value.subtitle) fieldErrors.subtitle = "Alt başlık boş bırakılamaz.";

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, value, fieldErrors: {} };
}

export interface PartnerInput {
  name: string;
  websiteUrl: string;
}

export type PartnerFieldErrors = Partial<Record<keyof PartnerInput, string>>;

export type PartnerValidationResult =
  | { valid: true; value: PartnerInput; fieldErrors: PartnerFieldErrors }
  | { valid: false; fieldErrors: PartnerFieldErrors };

export function validatePartnerInput(input: PartnerInput): PartnerValidationResult {
  const value: PartnerInput = {
    name: input.name.trim(),
    websiteUrl: input.websiteUrl.trim(),
  };

  const fieldErrors: PartnerFieldErrors = {};
  if (!value.name) fieldErrors.name = "İş ortağı adı boş bırakılamaz.";
  if (value.websiteUrl) {
    try {
      new URL(value.websiteUrl);
    } catch {
      fieldErrors.websiteUrl = "Lütfen geçerli bir URL girin (örn. https://ornek.com).";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, value, fieldErrors: {} };
}

export interface FeaturedSectionInput {
  title: string;
  subtitle: string;
  description: string;
}

/**
 * None of the featured-section fields are required — matches the old
 * panel, where "Ayarları Kaydet" accepted an empty title/subtitle/
 * description. This just trims.
 */
export function validateFeaturedSectionInput(input: FeaturedSectionInput): FeaturedSectionInput {
  return {
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    description: input.description.trim(),
  };
}

export interface ServiceFormInput {
  name: string;
  shortDescription: string;
  longDescription: string;
  iconSvg: string;
}

export type ServiceFieldErrors = Partial<Record<keyof ServiceFormInput, string>>;

export type ServiceValidationResult =
  | { valid: true; value: ServiceFormInput; fieldErrors: ServiceFieldErrors }
  | { valid: false; fieldErrors: ServiceFieldErrors };

export function validateServiceInput(input: ServiceFormInput): ServiceValidationResult {
  const value: ServiceFormInput = {
    name: input.name.trim(),
    shortDescription: input.shortDescription.trim(),
    longDescription: input.longDescription.trim(),
    iconSvg: input.iconSvg.trim(),
  };

  const fieldErrors: ServiceFieldErrors = {};
  if (!value.name) fieldErrors.name = "Başlık boş bırakılamaz.";
  if (!value.shortDescription) fieldErrors.shortDescription = "Kısa açıklama boş bırakılamaz.";
  if (!value.longDescription) fieldErrors.longDescription = "Detaylı açıklama boş bırakılamaz.";
  if (!value.iconSvg) fieldErrors.iconSvg = "İkon SVG kodu boş bırakılamaz.";

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, value, fieldErrors: {} };
}

export interface StatFormInput {
  value: string;
  label: string;
  description: string;
  iconSvg: string;
}

export type StatFieldErrors = Partial<Record<keyof StatFormInput, string>>;

export type StatValidationResult =
  | { valid: true; value: { value: number; label: string; description: string; iconSvg: string }; fieldErrors: StatFieldErrors }
  | { valid: false; fieldErrors: StatFieldErrors };

export function validateStatInput(input: StatFormInput): StatValidationResult {
  const label = input.label.trim();
  const description = input.description.trim();
  const iconSvg = input.iconSvg.trim();

  const fieldErrors: StatFieldErrors = {};
  const numericValue = Number(input.value);
  if (!input.value.trim() || Number.isNaN(numericValue) || numericValue < 0) {
    fieldErrors.value = "Geçerli bir değer girin.";
  }
  if (!label) fieldErrors.label = "Etiket boş bırakılamaz.";
  if (!description) fieldErrors.description = "Açıklama boş bırakılamaz.";
  if (!iconSvg) fieldErrors.iconSvg = "İkon SVG kodu boş bırakılamaz.";

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, value: { value: numericValue, label, description, iconSvg }, fieldErrors: {} };
}
