import type { RequestStatus } from "@/lib/types";
import { Icon } from "./Icon";

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string; icon?: string; dot?: boolean }
> = {
  beklemede: {
    label: "Beklemede",
    className: "bg-sand-light/20 text-sand-light border-sand-light/20",
    dot: true,
  },
  onaylandi: {
    label: "Onaylandı",
    className: "bg-secondary/20 text-secondary border-secondary/20",
    dot: true,
  },
  revize_istendi: {
    label: "Revize İstendi",
    className: "bg-tertiary/20 text-tertiary border-tertiary/20",
    icon: "edit_note",
  },
  reddedildi: {
    label: "Reddedildi",
    className: "bg-error/10 text-error border-error/20",
    icon: "cancel",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium border ${config.className}`}
    >
      {config.dot && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />}
      {config.icon && <Icon name={config.icon} className="mr-1 text-[14px]" />}
      {config.label}
    </span>
  );
}
