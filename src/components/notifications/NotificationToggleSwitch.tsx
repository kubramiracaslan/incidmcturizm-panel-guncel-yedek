"use client";

import { useState, useTransition } from "react";
import { updateNotificationPreferenceAction } from "@/lib/notifications/actions";

interface NotificationToggleSwitchProps {
  prefKey: string;
  initialEnabled: boolean;
  label: string;
}

/** Görünümü `ui/ToggleSwitch`'le aynı; farkı kendi anahtarını sunucuya
 * optimistic olarak kaydetmesi (hata olursa eski değere dönmesi). */
export function NotificationToggleSwitch({
  prefKey,
  initialEnabled,
  label,
}: NotificationToggleSwitchProps) {
  const [checked, setChecked] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !checked;
    setChecked(next);
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateNotificationPreferenceAction(prefKey, next);
        if (result.error) {
          setChecked(!next);
          setError(result.error);
        }
      } catch {
        setChecked(!next);
        setError("Tercih kaydedilemedi, lütfen tekrar deneyin.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={toggle}
        disabled={isPending}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-60 ${
          checked ? "border-secondary bg-secondary/40" : "border-outline-variant bg-surface-deep"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4.5 w-4.5 rounded-full transition-transform ${
            checked ? "translate-x-5 bg-secondary" : "translate-x-0 bg-on-surface-variant"
          }`}
          style={{ height: "1.125rem", width: "1.125rem" }}
        />
      </button>
      {error && <p className="text-right text-xs text-error">{error}</p>}
    </div>
  );
}
