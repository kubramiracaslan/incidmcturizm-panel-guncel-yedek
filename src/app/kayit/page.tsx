"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { CountryCitySelect } from "@/components/forms/CountryCitySelect";
import { signUpAction, type SignUpFieldErrors } from "@/lib/auth/actions";
import {
  validateAgencyRegistrationInput,
  type AgencyGender,
  type AgencyRegistrationInput,
} from "@/lib/validation/agency-registration";
import { validateNewPassword, validatePasswordsMatch } from "@/lib/validation/password";

interface KayitFormValues extends AgencyRegistrationInput {
  password: string;
  confirmPassword: string;
}

const initialValues: KayitFormValues = {
  acentaIsmi: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  mobilePhone: "",
  country: "",
  city: "",
  address: "",
  gender: "",
  password: "",
  confirmPassword: "",
};

interface FieldProps {
  label: string;
  name: keyof KayitFormValues;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  onChange: (name: keyof KayitFormValues, value: string) => void;
}

function Field({ label, name, value, error, type = "text", autoComplete, onChange }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
          error
            ? "border-error focus:border-error focus:ring-error/50"
            : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
        }`}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

export default function KayitPage() {
  const [values, setValues] = useState<KayitFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(name: keyof KayitFormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateAgencyRegistrationInput(values);
    const passwordError = validateNewPassword(values.password);
    const matchError = passwordError
      ? undefined
      : validatePasswordsMatch(values.password, values.confirmPassword);

    if (!validation.valid || passwordError || matchError) {
      setFieldErrors({
        ...(validation.valid ? {} : validation.fieldErrors),
        ...(passwordError ? { password: passwordError } : {}),
        ...(matchError ? { confirmPassword: matchError } : {}),
      });
      setFormError("Lütfen formu kontrol edin.");
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const formData = new FormData();
    formData.set("acentaIsmi", validation.value.acentaIsmi);
    formData.set("firstName", validation.value.firstName);
    formData.set("lastName", validation.value.lastName);
    formData.set("email", validation.value.email);
    formData.set("phone", validation.value.phone);
    formData.set("mobilePhone", validation.value.mobilePhone);
    formData.set("country", validation.value.country);
    formData.set("city", validation.value.city);
    formData.set("address", validation.value.address);
    formData.set("gender", validation.value.gender);
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);

    startTransition(async () => {
      const result = await signUpAction(formData);
      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface-deep px-4 py-12 sm:px-6 lg:px-8">
        <div className="z-10 w-full sm:mx-auto sm:max-w-md">
          <div className="glass-panel rounded-xl p-8 text-center shadow-2xl">
            <Icon name="mark_email_read" className="mb-4 text-5xl text-secondary" />
            <h2 className="mb-2 text-headline-md font-headline-md text-on-surface">
              Kaydınız alındı
            </h2>
            <p className="mb-6 text-body-md text-on-surface-variant">
              Başvurunuz yönetici onayına gönderildi. Onaylandığında bu e-posta ve şifrenizle
              giriş yapabileceksiniz.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-body-md font-semibold text-primary-container transition-colors hover:bg-brand-dark"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-surface-deep px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute top-1/2 -left-48 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="z-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="relative h-20 w-20">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-primary/20 bg-primary-container p-1 shadow-2xl">
              <div className="flex h-full w-full items-center justify-center p-2">
                <Image
                  src="/logo.png"
                  alt="İnci DMC Turizm"
                  width={72}
                  height={72}
                  className="rounded-full object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        <h1 className="mt-6 text-center text-headline-lg font-headline-lg font-bold text-primary">
          İnci DMC Turizm
        </h1>
        <p className="mt-2 text-center text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
          Acente Kayıt
        </p>
      </div>

      <div className="z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="glass-panel rounded-xl p-8 shadow-2xl">
          <h2 className="mb-1 text-headline-md font-headline-md text-on-surface">Kayıt Ol</h2>
          <p className="mb-6 text-body-md text-on-surface-variant">
            Bilgilerinizi girin, başvurunuz yönetici onayına gönderilsin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Acenta İsmi"
              name="acentaIsmi"
              value={values.acentaIsmi}
              error={fieldErrors.acentaIsmi}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="İsim"
                name="firstName"
                value={values.firstName}
                error={fieldErrors.firstName}
                onChange={handleChange}
              />
              <Field
                label="Soyisim"
                name="lastName"
                value={values.lastName}
                error={fieldErrors.lastName}
                onChange={handleChange}
              />
            </div>

            <Field
              label="E-posta"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              error={fieldErrors.email}
              onChange={handleChange}
            />

            <div>
              <label className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                Sabit Hat
              </label>
              <PhoneInput
                name="phone"
                value={values.phone}
                error={fieldErrors.phone}
                onChange={(e164) => handleChange("phone", e164)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                Cep Telefonu
              </label>
              <PhoneInput
                name="mobilePhone"
                value={values.mobilePhone}
                error={fieldErrors.mobilePhone}
                onChange={(e164) => handleChange("mobilePhone", e164)}
              />
            </div>

            <CountryCitySelect
              city={values.city}
              countryError={fieldErrors.country}
              cityError={fieldErrors.city}
              onCountryChange={(name) => handleChange("country", name)}
              onCityChange={(name) => handleChange("city", name)}
            />

            <Field
              label="Adres"
              name="address"
              value={values.address}
              error={fieldErrors.address}
              onChange={handleChange}
            />

            <div>
              <label
                htmlFor="gender"
                className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
              >
                Cinsiyet
              </label>
              <select
                id="gender"
                name="gender"
                value={values.gender}
                onChange={(e) => handleChange("gender", e.target.value as AgencyGender | "")}
                className={`w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 ${
                  fieldErrors.gender
                    ? "border-error focus:border-error focus:ring-error/50"
                    : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
                }`}
              >
                <option value="" disabled>
                  Seçiniz
                </option>
                <option value="erkek">Erkek</option>
                <option value="kadin">Kadın</option>
              </select>
              {fieldErrors.gender && <p className="mt-1 text-xs text-error">{fieldErrors.gender}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Şifre"
                name="password"
                type="password"
                autoComplete="new-password"
                value={values.password}
                error={fieldErrors.password}
                onChange={handleChange}
              />
              <Field
                label="Şifre (Tekrar)"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                error={fieldErrors.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                <Icon name="error" className="mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-8 py-3 text-body-lg font-bold text-primary-container shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="font-semibold text-secondary hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
