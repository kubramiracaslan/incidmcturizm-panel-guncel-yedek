"use client";

import { useState, useTransition } from "react";
import { updateServiceStatusAction } from "@/lib/data/home-actions";

interface ServiceStatusToggleButtonProps {
  id: string;
  isActive: boolean;
}

export function ServiceStatusToggleButton({ id, isActive }: ServiceStatusToggleButtonProps) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const result = await updateServiceStatusAction(id, next);
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
      title={active ? "Pasif yapmak için tıklayın" : "Aktif yapmak için tıklayın"}
      className="inline-flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-80 disabled:opacity-50"
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
      <span className={`text-xs font-medium ${active ? "text-secondary" : "text-on-surface-variant"}`}>
        {active ? "Aktif" : "Pasif"}
      </span>
    </button>
  );
}
