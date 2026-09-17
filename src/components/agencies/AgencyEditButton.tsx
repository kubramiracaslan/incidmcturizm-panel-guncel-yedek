"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { updateAgencyProfileAction } from "@/lib/data/actions";
import {
  validateAgencyProfileInput,
  type AgencyProfileFieldErrors,
  type AgencyProfileInput,
} from "@/lib/validation/agency";
import type { Agency } from "@/lib/types";

interface AgencyEditButtonProps {
  agency: Agency;
}

function toFormValues(agency: Agency): AgencyProfileInput {
  return {
    acentaIsmi: agency.name,
    firstName: agency.firstName,
    lastName: agency.lastName,
    email: agency.email,
    phone: agency.phone,
  };
}

interface FieldProps {
  label: string;
  name: keyof AgencyProfileInput;
  value: string;
  error?: string;
  type?: string;
  onChange: (name: keyof AgencyProfileInput, value: string) => void;
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

export function AgencyEditButton({ agency }: AgencyEditButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [values, setValues] = useState<AgencyProfileInput>(() => toFormValues(agency));
  const [fieldErrors, setFieldErrors] = useState<AgencyProfileFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const initialValues = toFormValues(agency);
  const isDirty = (Object.keys(initialValues) as (keyof AgencyProfileInput)[]).some(
    (key) => values[key] !== initialValues[key],
  );

  function openDrawer() {
    setValues(initialValues);
    setFieldErrors({});
    setFormError(null);
    setSuccessMessage(null);
    setOpen(true);
  }

  function requestClose() {
    if (isDirty) {
      setConfirmingClose(true);
    } else {
      setOpen(false);
    }
  }

  function discardAndClose() {
    setConfirmingClose(false);
    setOpen(false);
  }

  function handleChange(name: keyof AgencyProfileInput, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function submitForm() {
    const validation = validateAgencyProfileInput(values);
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
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

    startTransition(async () => {
      const result = await updateAgencyProfileAction(agency.id, formData);
      if (result.error) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setConfirmingClose(false);
      setOpen(false);
      setSuccessMessage("Kayıt başarıyla güncellendi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitForm();
  }

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Kaydı düzenle"
        className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
      >
        <Icon name="edit" className="text-[20px]" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end whitespace-normal bg-black/60">
          <div className="flex h-full w-full max-w-md flex-col border-l border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                Kaydı Düzenle
              </h3>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Kapat"
                className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name="close" />
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col overflow-y-auto"
            >
              <div className="flex-1 space-y-4 p-6">
                <Field
                  label="Acenta İsmi"
                  name="acentaIsmi"
                  value={values.acentaIsmi}
                  error={fieldErrors.acentaIsmi}
                  onChange={handleChange}
                />
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
                <Field
                  label="E-posta"
                  name="email"
                  type="email"
                  value={values.email}
                  error={fieldErrors.email}
                  onChange={handleChange}
                />
                <Field
                  label="Telefon"
                  name="phone"
                  type="tel"
                  value={values.phone}
                  error={fieldErrors.phone}
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
                  onClick={requestClose}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmingClose && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl">
            <h3 className="mb-2 text-headline-sm font-headline-sm font-bold text-on-surface">
              Kaydedilmemiş değişiklikler var
            </h3>
            <p className="mb-6 text-sm text-on-surface-variant">
              Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={discardAndClose}
                className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submitForm}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
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
