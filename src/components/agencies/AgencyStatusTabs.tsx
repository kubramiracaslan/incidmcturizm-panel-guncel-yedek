import Link from "next/link";
import type { AgencyStatus } from "@/lib/types";

const tabs: { status: AgencyStatus | ""; label: string }[] = [
  { status: "", label: "Tümü" },
  { status: "pending", label: "Bekleyen Başvurular" },
  { status: "approved", label: "Onaylananlar" },
  { status: "rejected", label: "Reddedilenler" },
];

export function AgencyStatusTabs({
  basePath,
  activeStatus,
}: {
  basePath: string;
  activeStatus: string;
}) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-white/5 px-6 pt-4">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.status;
        const href = tab.status ? `${basePath}?status=${tab.status}` : basePath;
        return (
          <Link
            key={tab.label}
            href={href}
            className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
