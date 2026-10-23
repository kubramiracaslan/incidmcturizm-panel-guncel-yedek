"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { CountryCitySelect } from "@/components/forms/CountryCitySelect";
import { createAgencyAction, type CreateAgencyFieldErrors } from "@/lib/auth/admin-actions";
import {
  validateAgencyRegistrationInput,
  type AgencyGender,
  type AgencyRegistrationInput,
} from "@/lib/validation/agency-registration";
import { validateNewPassword } from "@/lib/validation/password";

interface CreateAgencyFormValues extends AgencyRegistrationInput {
  password: string;
}

const initialValues: CreateAgencyFormValues = {
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
};

interface FieldProps {
  label: string;
  name: keyof CreateAgencyFormValues;
  value: string;
  error?: string;
  type?: string;
  onChange: (name: keyof CreateAgencyFormValues, value: string) => void;
}

function Field({ label, name, value, error, type = "text", onChange }: FieldProps) {
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

export function AgencyCreateButton() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CreateAgencyFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<CreateAgencyFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openDrawer() {
    setValues(initialValues);
    setFieldErrors({});
    setFormError(null);
    setOpen(true);
  }

  function handleChange(name: keyof CreateAgencyFormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function submitForm() {
    const validation = validateAgencyRegistrationInput(values);
    const passwordError = validateNewPassword(values.password);

    if (!validation.valid || passwordError) {
      setFieldErrors({
        ...(validation.valid ? {} : validation.fieldErrors),
        ...(passwordError ? { password: passwordError } : {}),
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

    startTransition(async () => {
      const result = await createAgencyAction(formData);
      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setOpen(false);
      setSuccessMessage("Acente başarıyla eklendi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitForm();
  }

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-body-md font-body-md font-semibold text-primary-container shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)]"
      >
        <Icon name="add" className="text-lg" />
        Yeni Acente Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end whitespace-normal bg-black/60">
          <div className="flex h-full w-full max-w-md flex-col border-l border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                Yeni Acente Ekle
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 p-6">
                <Field
                  label="Acenta İsmi"
                  name="acentaIsmi"
                  value={values.acentaIsmi}
                  error={fieldErrors.acentaIsmi}
                  onChange={handleChange}
                />

                <div className="grid grid-cols-2 gap-4">
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
                  {fieldErrors.gender && (
                    <p className="mt-1 text-xs text-error">{fieldErrors.gender}</p>
                  )}
                </div>

                <Field
                  label="Şifre"
                  name="password"
                  type="password"
                  value={values.password}
                  error={fieldErrors.password}
                  onChange={handleChange}
                />

                {formError && (
                  <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                    {formError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-outline-variant/50 p-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {isPending ? "Ekleniyor..." : "Acenteyi Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary shadow-lg">
          {successMessage}
        </div>
      )}
    </>
  );
}
