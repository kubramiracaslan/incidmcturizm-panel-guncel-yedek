"use client";

import { useState, useTransition } from "react";
import { updateAgencyCanViewPricesAction } from "@/lib/data/actions";

interface AgencyPriceVisibilityToggleProps {
  agencyId: string;
  canViewPrices: boolean;
}

export function AgencyPriceVisibilityToggle({ agencyId, canViewPrices }: AgencyPriceVisibilityToggleProps) {
  const [canView, setCanView] = useState(canViewPrices);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !canView;
    setCanView(next);
    startTransition(async () => {
      const result = await updateAgencyCanViewPricesAction(agencyId, next);
      if (result.error) {
        setCanView(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={canView}
      title={canView ? "Fiyat görmesini kapatmak için tıklayın" : "Fiyat görmesine izin vermek için tıklayın"}
      className="inline-flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          canView ? "bg-secondary" : "bg-outline-variant"
        }`}
      >
        <span
          className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            canView ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span className={`text-xs font-medium ${canView ? "text-secondary" : "text-on-surface-variant"}`}>
        {canView ? "Görebilir" : "Göremez"}
      </span>
    </button>
  );
}
