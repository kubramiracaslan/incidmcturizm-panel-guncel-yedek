"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { createAgencyAction, type CreateAgencyFormState } from "@/lib/data/actions";

const initialState: CreateAgencyFormState = { error: null, success: false };

export function NewAgencyButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createAgencyAction(initialState, formData);
      if (result.success) {
        setError(null);
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-body-md font-body-md font-semibold text-primary-container shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)]"
      >
        <Icon name="add" className="text-lg" />
        Yeni Acente Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
                >
                  Acente Adı
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Örn. Daisy Travel"
                  className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>

              <div>
                <label
                  htmlFor="contactName"
                  className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
                >
                  Yetkili Adı
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  required
                  placeholder="Örn. Ahmet Yılmaz"
                  className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
                >
                  E-posta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ornek@sirket.com"
                  className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
                >
                  Telefon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+90 5xx xxx xx xx"
                  className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
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
                  {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
