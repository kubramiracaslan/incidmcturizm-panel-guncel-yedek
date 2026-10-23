import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/max";

export interface AdminProfileInput {
  fullName: string;
  phone: string;
}

export type AdminProfileFieldErrors = Partial<Record<keyof AdminProfileInput, string>>;

export type AdminProfileValidationResult =
  | { valid: true; value: AdminProfileInput; fieldErrors: AdminProfileFieldErrors }
  | { valid: false; fieldErrors: AdminProfileFieldErrors };

const FULL_NAME_MAX_LENGTH = 100;

export function validateAdminProfileInput(input: AdminProfileInput): AdminProfileValidationResult {
  const fullName = input.fullName.trim();
  const rawPhone = input.phone.trim();
  const fieldErrors: AdminProfileFieldErrors = {};

  if (!fullName) {
    fieldErrors.fullName = "Ad soyad boş bırakılamaz.";
  } else if (fullName.length > FULL_NAME_MAX_LENGTH) {
    fieldErrors.fullName = `Ad soyad en fazla ${FULL_NAME_MAX_LENGTH} karakter olabilir.`;
  }

  let phone = rawPhone;
  if (!rawPhone) {
    fieldErrors.phone = "Telefon zorunludur.";
  } else if (!isValidPhoneNumber(rawPhone)) {
    fieldErrors.phone = "Geçerli bir telefon numarası girin.";
  } else {
    phone = parsePhoneNumber(rawPhone).number;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, value: { fullName, phone }, fieldErrors: {} };
}
