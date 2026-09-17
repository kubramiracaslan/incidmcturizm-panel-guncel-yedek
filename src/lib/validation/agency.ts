/**
 * Pure, isomorphic validation for the agency profile edit form — no
 * server-only imports, safe to bundle into a client component. Both
 * `AgencyEditButton` (client, UX-only feedback) and
 * `updateAgencyProfileAction` (server, authoritative) call this same
 * function so the rules can never drift apart between the two.
 */

export interface AgencyProfileInput {
  acentaIsmi: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export type AgencyProfileFieldErrors = Partial<Record<keyof AgencyProfileInput, string>>;

export const AGENCY_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AgencyProfileValidationResult =
  | { valid: true; value: AgencyProfileInput; fieldErrors: AgencyProfileFieldErrors }
  | { valid: false; fieldErrors: AgencyProfileFieldErrors };

export function validateAgencyProfileInput(
  input: AgencyProfileInput,
): AgencyProfileValidationResult {
  const value: AgencyProfileInput = {
    acentaIsmi: input.acentaIsmi.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
  };

  const fieldErrors: AgencyProfileFieldErrors = {};
  if (!value.acentaIsmi) fieldErrors.acentaIsmi = "Acenta ismi boş bırakılamaz.";
  if (!value.firstName) fieldErrors.firstName = "İsim boş bırakılamaz.";
  if (!value.lastName) fieldErrors.lastName = "Soyisim boş bırakılamaz.";
  if (!value.email) {
    fieldErrors.email = "E-posta zorunludur.";
  } else if (!AGENCY_EMAIL_PATTERN.test(value.email)) {
    fieldErrors.email = "Lütfen geçerli bir e-posta adresi girin.";
  }
  if (!value.phone) fieldErrors.phone = "Telefon zorunludur.";

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, value, fieldErrors: {} };
}
