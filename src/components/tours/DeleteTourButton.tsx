"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { deleteTourAction } from "@/lib/data/tour-actions";

interface DeleteTourButtonProps {
  id: string;
  name: string;
}

export function DeleteTourButton({ id, name }: DeleteTourButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestDelete() {
    setError(null);
    setConfirming(true);
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteTourAction(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.push("/admin/tur-katalogu");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={requestDelete}
        className="inline-flex items-center gap-1.5 rounded-lg border border-error/30 px-4 py-2 text-sm text-error transition-colors hover:bg-error/10"
      >
        <Icon name="delete" className="text-[18px]" />
        Turu Sil
      </button>

      {confirming && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl">
            <h3 className="mb-2 text-headline-sm font-headline-sm font-bold text-on-surface">Turu sil</h3>
            <p className="mb-6 text-sm text-on-surface-variant">
              &quot;{name}&quot; ve bağlı tüm içerik (öne çıkanlar, program, fiyatlar, hava durumu) kalıcı olarak
              silinecek. Bu işlem geri alınamaz.
            </p>
            {error && <p className="mb-4 text-sm text-error">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDelete}
                className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-error/90 disabled:opacity-50"
              >
                {isPending ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
