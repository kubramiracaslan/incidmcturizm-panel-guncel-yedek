import { Icon } from "./Icon";

export type StatCardTone = "highlight" | "default" | "pending" | "success" | "revision";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  hint?: string;
  /**
   * "highlight" = the accented primary-container card (first in a row).
   * "pending" / "success" / "revision" reuse the same semantic colors as
   * the request StatusBadge (warning / secondary / tertiary) so a status
   * reads as the same color everywhere in the app.
   */
  tone?: StatCardTone;
}

const toneStyles: Record<
  StatCardTone,
  { border: string; bg: string; label: string; icon: string; blob: string | null }
> = {
  default: {
    border: "border-outline-variant/50",
    bg: "bg-surface-variant",
    label: "text-on-surface-variant",
    icon: "text-on-surface-variant/70",
    blob: null,
  },
  highlight: {
    border: "border-white/10",
    bg: "bg-primary-container",
    label: "text-on-primary-container",
    icon: "text-primary",
    blob: "bg-primary/10",
  },
  pending: {
    border: "border-warning/30",
    bg: "bg-surface-variant",
    label: "text-on-surface-variant",
    icon: "text-warning",
    blob: "bg-warning/10",
  },
  success: {
    border: "border-secondary/30",
    bg: "bg-surface-variant",
    label: "text-on-surface-variant",
    icon: "text-secondary",
    blob: "bg-secondary/10",
  },
  revision: {
    border: "border-tertiary/30",
    bg: "bg-surface-variant",
    label: "text-on-surface-variant",
    icon: "text-tertiary",
    blob: "bg-tertiary/10",
  },
};

export function StatCard({ label, value, icon, hint, tone = "default" }: StatCardProps) {
  const style = toneStyles[tone];

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 ${style.border} ${style.bg}`}>
      {style.blob && (
        <div className={`absolute -top-4 -mr-4 right-0 h-24 w-24 rounded-bl-full ${style.blob}`} />
      )}
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <p className={`text-label-sm font-label-sm uppercase ${style.label}`}>{label}</p>
        <Icon name={icon} className={`text-xl ${style.icon}`} />
      </div>
      <h3 className="relative z-10 text-headline-lg font-headline-lg font-bold text-on-surface">
        {value}
      </h3>
      {hint && (
        <p className="relative z-10 mt-2 text-xs text-on-surface-variant">{hint}</p>
      )}
    </div>
  );
}
