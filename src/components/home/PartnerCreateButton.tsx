"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { createPartnerAction } from "@/lib/data/home-actions";
import { validatePartnerInput, type PartnerFieldErrors, type PartnerInput } from "@/lib/validation/home";
import { SiteImageUploadField, type UploadedImage } from "./SiteImageUploadField";

const emptyValues: PartnerInput = { name: "", websiteUrl: "" };

export function PartnerCreateButton() {
  const [open, setOpen] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [values, setValues] = useState<PartnerInput>(emptyValues);
  const [logo, setLogo] = useState<UploadedImage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PartnerFieldErrors>({});
  const [logoError, setLogoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty = values.name !== "" || values.websiteUrl !== "" || logo !== null;

  function openForm() {
    setValues(emptyValues);
    setLogo(null);
    setFieldErrors({});
    setLogoError(null);
    setFormError(null);
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

  function handleChange(name: keyof PartnerInput, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function submitForm() {
    const validation = validatePartnerInput(values);
    if (!logo) {
      setLogoError("Lütfen bir logo görseli seçin.");
    }
    if (!validation.valid || !logo) {
      setFieldErrors(validation.valid ? {} : validation.fieldErrors);
      return;
    }
    setFieldErrors({});
    setLogoError(null);
    setFormError(null);

    const formData = new FormData();
    formData.set("name", validation.value.name);
    formData.set("websiteUrl", validation.value.websiteUrl);
    formData.set("logoPath", logo.path);

    startTransition(async () => {
      const result = await createPartnerAction(formData);
      if (result.error) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setConfirmingClose(false);
      setOpen(false);
      setSuccessMessage(`"${validation.value.name}" başarıyla eklendi.`);
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
        onClick={openForm}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-primary-container transition-colors hover:bg-brand-dark"
      >
        Yeni Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="flex h-full max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                Yeni İş Ortağı Ekle
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
                <div>
                  <label
                    htmlFor="partnerName"
                    className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
                  >
                    İş Ortağı Adı
                  </label>
                  <input
                    id="partnerName"
                    type="text"
                    value={values.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
                      fieldErrors.name
                        ? "border-error focus:border-error focus:ring-error/50"
                        : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
                    }`}
                  />
                  {fieldErrors.name && <p className="mt-1 text-xs text-error">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label
                    htmlFor="partnerWebsiteUrl"
                    className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
                  >
                    Website URL
                  </label>
                  <input
                    id="partnerWebsiteUrl"
                    type="url"
                    placeholder="https://"
                    value={values.websiteUrl}
                    onChange={(e) => handleChange("websiteUrl", e.target.value)}
                    className={`w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
                      fieldErrors.websiteUrl
                        ? "border-error focus:border-error focus:ring-error/50"
                        : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
                    }`}
                  />
                  {fieldErrors.websiteUrl && <p className="mt-1 text-xs text-error">{fieldErrors.websiteUrl}</p>}
                </div>

                <SiteImageUploadField
                  label="Logo"
                  imageType="partner"
                  currentUrl={null}
                  maxSizeMB={2}
                  onChange={(image) => {
                    setLogo(image);
                    if (image) setLogoError(null);
                  }}
                />
                {logoError && <p className="text-xs text-error">{logoError}</p>}

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
