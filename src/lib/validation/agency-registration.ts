/**
 * Pure, isomorphic validation for the full `acentalar` profile field set —
 * shared by the self-servis kayıt page and the admin's "Yeni Acente Ekle"
 * form, since both write the same set of columns and only differ in which
 * password field(s) they carry (composed separately via
 * `lib/validation/password.ts`, not part of this type). No server-only
 * imports, safe to bundle into a client component. Kept separate from
 * `lib/validation/agency.ts`, which validates the smaller edit-form field
 * set and must not change.
 */

import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/max";
import { AGENCY_EMAIL_PATTERN } from "./agency";

export type AgencyGender = "erkek" | "kadin";

export interface AgencyRegistrationInput {
  acentaIsmi: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobilePhone: string;
  country: string;
  city: string;
  address: string;
  gender: AgencyGender | "";
}

export type AgencyRegistrationFieldErrors = Partial<Record<keyof AgencyRegistrationInput, string>>;

export type AgencyRegistrationValidationResult =
  | {
      valid: true;
      value: AgencyRegistrationInput & { gender: AgencyGender };
      fieldErrors: AgencyRegistrationFieldErrors;
    }
  | { valid: false; fieldErrors: AgencyRegistrationFieldErrors };

export function validateAgencyRegistrationInput(
  input: AgencyRegistrationInput,
): AgencyRegistrationValidationResult {
  const value: AgencyRegistrationInput = {
    acentaIsmi: input.acentaIsmi.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    mobilePhone: input.mobilePhone.trim(),
    country: input.country.trim(),
    city: input.city.trim(),
    address: input.address.trim(),
    gender: input.gender,
  };

  const fieldErrors: AgencyRegistrationFieldErrors = {};
  if (!value.acentaIsmi) fieldErrors.acentaIsmi = "Acenta ismi boş bırakılamaz.";
  if (!value.firstName) fieldErrors.firstName = "İsim boş bırakılamaz.";
  if (!value.lastName) fieldErrors.lastName = "Soyisim boş bırakılamaz.";
  if (!value.email) {
    fieldErrors.email = "E-posta zorunludur.";
  } else if (!AGENCY_EMAIL_PATTERN.test(value.email)) {
    fieldErrors.email = "Lütfen geçerli bir e-posta adresi girin.";
  }
  if (!value.phone) {
    fieldErrors.phone = "Telefon zorunludur.";
  } else if (!isValidPhoneNumber(value.phone)) {
    fieldErrors.phone = "Geçerli bir telefon numarası girin.";
  } else {
    value.phone = parsePhoneNumber(value.phone).number;
  }
  if (!value.mobilePhone) {
    fieldErrors.mobilePhone = "Cep telefonu zorunludur.";
  } else if (!isValidPhoneNumber(value.mobilePhone)) {
    fieldErrors.mobilePhone = "Geçerli bir telefon numarası girin.";
  } else if (parsePhoneNumber(value.mobilePhone).getType() === "FIXED_LINE") {
    fieldErrors.mobilePhone = "Cep telefonu alanına sabit hat girilemez.";
  } else {
    value.mobilePhone = parsePhoneNumber(value.mobilePhone).number;
  }
  if (!value.country) fieldErrors.country = "Ülke zorunludur.";
  if (!value.city) fieldErrors.city = "Şehir zorunludur.";
  if (!value.address) fieldErrors.address = "Adres zorunludur.";
  if (value.gender !== "erkek" && value.gender !== "kadin") {
    fieldErrors.gender = "Lütfen bir seçenek seçin.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, value: value as AgencyRegistrationInput & { gender: AgencyGender }, fieldErrors: {} };
}
