"use client";

import { useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { retryOmSyncAction } from "@/lib/data/actions";

export function OmSyncRetryButton({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await retryOmSyncAction(requestId);
        })
      }
      className="inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning transition-colors hover:bg-warning/20 disabled:opacity-50"
    >
      <Icon name="sync" className="text-[14px]" />
      {isPending ? "Gönderiliyor..." : "Şimdi tekrar gönder"}
    </button>
  );
}
