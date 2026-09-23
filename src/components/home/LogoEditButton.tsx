"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { updateHomeLogoAction } from "@/lib/data/home-actions";
import { SiteImageUploadField, type UploadedImage } from "./SiteImageUploadField";

interface LogoEditButtonProps {
  currentLogoUrl: string | null;
}

export function LogoEditButton({ currentLogoUrl }: LogoEditButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [newLogo, setNewLogo] = useState<UploadedImage | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty = newLogo !== null;

  function openDrawer() {
    setNewLogo(null);
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

  function submitForm() {
    if (!newLogo) return;
    setFormError(null);

    const formData = new FormData();
    formData.set("logoPath", newLogo.path);

    startTransition(async () => {
      const result = await updateHomeLogoAction(formData);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setConfirmingClose(false);
      setOpen(false);
      setSuccessMessage("Logo başarıyla güncellendi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-primary-container transition-colors hover:bg-brand-dark"
      >
        Değiştir
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end whitespace-normal bg-black/60">
          <div className="flex h-full w-full max-w-md flex-col border-l border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Logoyu Değiştir</h3>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Kapat"
                className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 p-6">
                <SiteImageUploadField
                  label="Logo"
                  imageType="logo"
                  currentUrl={currentLogoUrl}
                  maxSizeMB={2}
                  onChange={setNewLogo}
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
                  type="button"
                  disabled={isPending || !newLogo}
                  onClick={submitForm}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </div>
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
