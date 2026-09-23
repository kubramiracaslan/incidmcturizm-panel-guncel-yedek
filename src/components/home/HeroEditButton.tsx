"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { updateHomeHeroAction } from "@/lib/data/home-actions";
import { validateHeroInput, type HeroFieldErrors, type HeroInput } from "@/lib/validation/home";
import { SiteImageUploadField, type UploadedImage } from "./SiteImageUploadField";

interface HeroEditButtonProps {
  hero: { title: string; subtitle: string; imageUrl: string | null };
}

interface FieldProps {
  label: string;
  name: keyof HeroInput;
  value: string;
  error?: string;
  onChange: (name: keyof HeroInput, value: string) => void;
}

function Field({ label, name, value, error, onChange }: FieldProps) {
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
        type="text"
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

export function HeroEditButton({ hero }: HeroEditButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [values, setValues] = useState<HeroInput>({ title: hero.title, subtitle: hero.subtitle });
  const [newImage, setNewImage] = useState<UploadedImage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<HeroFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty = values.title !== hero.title || values.subtitle !== hero.subtitle || newImage !== null;

  function openDrawer() {
    setValues({ title: hero.title, subtitle: hero.subtitle });
    setNewImage(null);
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

  function handleChange(name: keyof HeroInput, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function submitForm() {
    const validation = validateHeroInput(values);
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      return;
    }
    setFieldErrors({});
    setFormError(null);

    const formData = new FormData();
    formData.set("title", validation.value.title);
    formData.set("subtitle", validation.value.subtitle);
    if (newImage) formData.set("imagePath", newImage.path);

    startTransition(async () => {
      const result = await updateHomeHeroAction(formData);
      if (result.error) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setConfirmingClose(false);
      setOpen(false);
      setSuccessMessage("Hero banner başarıyla güncellendi.");
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
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-primary-container transition-colors hover:bg-brand-dark"
      >
        Düzenle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end whitespace-normal bg-black/60">
          <div className="flex h-full w-full max-w-md flex-col border-l border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                Hero Banner&apos;ı Düzenle
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

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 p-6">
                <SiteImageUploadField
                  label="Hero Görseli"
                  imageType="hero"
                  currentUrl={hero.imageUrl}
                  maxSizeMB={5}
                  onChange={setNewImage}
                />
                <Field label="Başlık" name="title" value={values.title} error={fieldErrors.title} onChange={handleChange} />
                <Field
                  label="Alt Başlık"
                  name="subtitle"
                  value={values.subtitle}
                  error={fieldErrors.subtitle}
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
