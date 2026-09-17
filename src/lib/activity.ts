import type { ActivityItem } from "@/components/dashboard/RecentActivity";
import type { TeklifTalebi } from "@/lib/types";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 60) return relativeTimeFormatter.format(-diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return relativeTimeFormatter.format(-diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(-diffDays, "day");
}

const statusMeta: Record<
  TeklifTalebi["status"],
  { title: string; dotColorClass: string; describe: (r: TeklifTalebi) => string }
> = {
  onaylandi: {
    title: "Talep onaylandı, tura dönüştü",
    dotColorClass: "bg-secondary",
    describe: (r) => `#${r.id} numaralı ${r.tourName} talebi onaylandı. (${r.adults + r.children} Kişi)`,
  },
  beklemede: {
    title: "Yeni talep iletildi",
    dotColorClass: "bg-warning",
    describe: (r) => `${r.tourName} için ${r.adults + r.children} kişilik talep iletildi.`,
  },
  revize_istendi: {
    title: "Revize istendi",
    dotColorClass: "bg-tertiary",
    describe: (r) => `#${r.id} ${r.tourName} talebi için revize istendi.`,
  },
  reddedildi: {
    title: "Talep reddedildi",
    dotColorClass: "bg-error",
    describe: (r) => `#${r.id} ${r.tourName} talebi reddedildi.`,
  },
};

export function buildActivityFeed(requests: TeklifTalebi[], limit = 4): ActivityItem[] {
  return [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((request) => {
      const meta = statusMeta[request.status];
      return {
        id: request.id,
        title: meta.title,
        description: meta.describe(request),
        timeLabel: relativeTime(request.createdAt),
        dotColorClass: meta.dotColorClass,
      };
    });
}
