"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { createStatAction, updateStatAction } from "@/lib/data/home-actions";
import { validateStatInput, type StatFieldErrors, type StatFormInput } from "@/lib/validation/home";
import type { SiteStat } from "@/lib/types";

type StatFormProps =
  | { mode: "create"; renderTrigger: (open: () => void) => ReactNode }
  | { mode: "edit"; stat: SiteStat; renderTrigger: (open: () => void) => ReactNode };

const emptyValues: StatFormInput = { value: "", label: "", description: "", iconSvg: "" };

function toFormValues(stat?: SiteStat): StatFormInput {
  if (!stat) return emptyValues;
  return {
    value: String(stat.value),
    label: stat.label,
    description: stat.description,
    iconSvg: stat.iconSvg,
  };
}

interface FieldProps {
  label: string;
  value: string;
  error?: string;
  multiline?: boolean;
  mono?: boolean;
  rows?: number;
  hint?: string;
  type?: string;
  onChange: (value: string) => void;
}

function Field({ label, value, error, multiline, mono, rows = 3, hint, type = "text", onChange }: FieldProps) {
  const className = `w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
    mono ? "font-mono text-xs" : ""
  } ${
    error
      ? "border-error focus:border-error focus:ring-error/50"
      : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
  }`;

  return (
    <div>
      <label className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={className} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      )}
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function StatForm(props: StatFormProps) {
  const stat = props.mode === "edit" ? props.stat : undefined;
  const [open, setOpen] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [values, setValues] = useState<StatFormInput>(() => toFormValues(stat));
  const [fieldErrors, setFieldErrors] = useState<StatFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialValues = toFormValues(stat);
  const isDirty = (Object.keys(initialValues) as (keyof StatFormInput)[]).some(
    (key) => values[key] !== initialValues[key],
  );

  function openModal() {
    setValues(initialValues);
    setFieldErrors({});
    setFormError(null);
    setSuccessMessage(null);
    setOpen(true);
  }

  function requestClose() {
    if (isDirty) setConfirmingClose(true);
    else setOpen(false);
  }

  function discardAndClose() {
    setConfirmingClose(false);
    setOpen(false);
  }

  function handleChange(name: keyof StatFormInput, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function submitForm() {
    const validation = validateStatInput(values);
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      return;
    }
    setFieldErrors({});
    setFormError(null);

    const formData = new FormData();
    formData.set("value", String(validation.value.value));
    formData.set("label", validation.value.label);
    formData.set("description", validation.value.description);
    formData.set("iconSvg", validation.value.iconSvg);

    startTransition(async () => {
      const result =
        props.mode === "edit" ? await updateStatAction(props.stat.id, formData) : await createStatAction(formData);
      if (result.error) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setConfirmingClose(false);
      setOpen(false);
      setSuccessMessage(props.mode === "edit" ? "İstatistik güncellendi." : "İstatistik başarıyla eklendi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitForm();
  }

  return (
    <>
      {props.renderTrigger(openModal)}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="flex h-full max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {props.mode === "edit" ? "İstatistiği Düzenle" : "Yeni İstatistik Ekle"}
              </h2>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Kapat"
                className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 p-6">
                <Field
                  label="Değer"
                  type="number"
                  value={values.value}
                  error={fieldErrors.value}
                  onChange={(v) => handleChange("value", v)}
                />
                <Field
                  label="Etiket"
                  value={values.label}
                  error={fieldErrors.label}
                  onChange={(v) => handleChange("label", v)}
                />
                <Field
                  label="Açıklama"
                  value={values.description}
                  error={fieldErrors.description}
                  onChange={(v) => handleChange("description", v)}
                />
                <Field
                  label="İkon SVG"
                  value={values.iconSvg}
                  error={fieldErrors.iconSvg}
                  multiline
                  mono
                  rows={4}
                  hint="SVG kodunu buraya yapıştırın. width/height özelliklerini kaldırın."
                  onChange={(v) => handleChange("iconSvg", v)}
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
                  {isPending ? "Kaydediliyor..." : "Kaydet"}
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
            <p className="mb-6 text-sm text-on-surface-variant">Çıkmak istediğinize emin misiniz?</p>
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
                {isPending ? "Kaydediliyor..." : "Kaydet"}
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

export function StatCreateButton() {
  return (
    <StatForm
      mode="create"
      renderTrigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-primary-container transition-colors hover:bg-brand-dark"
        >
          Yeni Ekle
        </button>
      )}
    />
  );
}

interface StatEditButtonProps {
  stat: SiteStat;
}

export function StatEditButton({ stat }: StatEditButtonProps) {
  return (
    <StatForm
      mode="edit"
      stat={stat}
      renderTrigger={(open) => (
        <button
          type="button"
          onClick={open}
          aria-label="Düzenle"
          className="rounded p-1 text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name="edit" className="text-[16px]" />
        </button>
      )}
    />
  );
}
