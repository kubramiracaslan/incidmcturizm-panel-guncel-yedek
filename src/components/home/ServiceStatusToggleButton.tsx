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
      className={`inline-flex items-center rounded border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "border-secondary/20 bg-secondary/20 text-secondary hover:bg-secondary/30"
          : "border-outline-variant bg-surface-variant text-on-surface-variant hover:bg-surface-container"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {active ? "Aktif" : "Pasif"}
    </button>
  );
}
