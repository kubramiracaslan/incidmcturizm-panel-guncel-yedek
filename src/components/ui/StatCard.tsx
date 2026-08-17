import { Icon } from "./Icon";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  hint?: string;
  /** "highlight" = the accented primary-container card (first in a row). */
  tone?: "highlight" | "default";
}

export function StatCard({ label, value, icon, hint, tone = "default" }: StatCardProps) {
  const isHighlight = tone === "highlight";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 ${
        isHighlight
          ? "border-white/10 bg-primary-container"
          : "border-outline-variant/50 bg-surface-variant"
      }`}
    >
      {isHighlight && (
        <div className="absolute -top-4 -mr-4 right-0 h-24 w-24 rounded-bl-full bg-primary/10" />
      )}
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <p
          className={`text-label-sm font-label-sm uppercase ${
            isHighlight ? "text-on-primary-container" : "text-on-surface-variant"
          }`}
        >
          {label}
        </p>
        <Icon
          name={icon}
          className={`text-xl ${isHighlight ? "text-primary" : "text-on-surface-variant/70"}`}
        />
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
