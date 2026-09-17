import type { AgencyStatus } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

const statusConfig: Record<AgencyStatus, { label: string; className: string; icon?: string; dot?: boolean }> = {
  pending: {
    label: "Bekliyor",
    className: "bg-warning/20 text-warning border-warning/20",
    dot: true,
  },
  approved: {
    label: "Onaylandı",
    className: "bg-secondary/20 text-secondary border-secondary/20",
    dot: true,
  },
  rejected: {
    label: "Reddedildi",
    className: "bg-error/10 text-error border-error/20",
    icon: "cancel",
  },
};

export function AgencyStatusBadge({ status }: { status: AgencyStatus }) {
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
