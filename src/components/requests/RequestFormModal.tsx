"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { RequestForm } from "./RequestForm";
import type { Tour } from "@/lib/types";

/** "Talep Oluştur" düğmesi + modal içinde {@link RequestForm}. Form,
 * createRequestAction'ın kendi yönlendirme davranışını korur (başarıda
 * sayfa değişir, modal bu sırada zaten ekrandan kalkar); burada eklenen
 * tek şey Esc ve dış alana tıklamayla kapatma. */
export function RequestFormModal({ tour }: { tour: Tour }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-body-md font-semibold text-primary-container shadow-sm transition-colors hover:bg-brand-dark"
      >
        <Icon name="add" filled className="text-lg" />
        Talep Oluştur
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full max-w-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Kapat"
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant shadow-lg transition-colors hover:text-error"
            >
              <Icon name="close" />
            </button>
            <RequestForm tour={tour} onCancel={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
