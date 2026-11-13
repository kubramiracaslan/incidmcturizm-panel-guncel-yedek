"use client";

import { useState, useTransition } from "react";
import { updateTourStatusAction } from "@/lib/data/tour-actions";

interface TourStatusToggleButtonProps {
  id: string;
  isActive: boolean;
}

export function TourStatusToggleButton({ id, isActive }: TourStatusToggleButtonProps) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const result = await updateTourStatusAction(id, next);
      if (result.error) {
        setActive(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={active}
      title={active ? "Pasife almak için tıklayın" : "Yayına almak için tıklayın"}
      className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container disabled:opacity-50"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          active ? "bg-secondary" : "bg-outline-variant"
        }`}
      >
        <span
          className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            active ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      {active ? "Aktif" : "Pasif"}
    </button>
  );
}
