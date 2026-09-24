"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { deleteStatAction } from "@/lib/data/home-actions";

interface StatDeleteButtonProps {
  id: string;
  label: string;
}

export function StatDeleteButton({ id, label }: StatDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestDelete() {
    setError(null);
    setConfirming(true);
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteStatAction(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirming(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={requestDelete}
        aria-label="Sil"
        className="rounded p-1 text-on-surface-variant transition-colors hover:text-error"
      >
        <Icon name="delete" className="text-[16px]" />
      </button>

      {confirming && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl">
            <h3 className="mb-2 text-headline-sm font-headline-sm font-bold text-on-surface">İstatistiği sil</h3>
            <p className="mb-6 text-sm text-on-surface-variant">
              &quot;{label}&quot; kalıcı olarak silinecek. Bu işlem geri alınamaz.
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
