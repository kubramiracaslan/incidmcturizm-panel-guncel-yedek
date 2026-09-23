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
