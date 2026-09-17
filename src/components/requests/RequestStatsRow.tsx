import { StatCard } from "@/components/ui/StatCard";
import type { DashboardStats } from "@/lib/types";

export function RequestStatsRow({ stats }: { stats: DashboardStats }) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatCard
        tone="highlight"
        icon="request_quote"
        label="Toplam Talep"
        value={stats.totalRequests}
      />
      <StatCard
        tone="pending"
        icon="pending"
        label="Bekleyen Talepler"
        value={stats.pendingRequests}
        hint="TEKLİF BEKLENİYOR"
      />
      <StatCard
        tone="success"
        icon="check_circle"
        label="Onaylanan Talepler"
        value={stats.approvedTours}
        hint="TURA DÖNÜŞTÜ"
      />
      <StatCard
        tone="revision"
        icon="edit_note"
        label="Revize İstenen Talepler"
        value={stats.revisionRequests}
      />
    </div>
  );
}
