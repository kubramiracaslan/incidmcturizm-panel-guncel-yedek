import Link from "next/link";
import { redirect } from "next/navigation";
import { AgentShell } from "@/components/layout/AgentShell";
import { Icon } from "@/components/ui/Icon";
import { StatCard } from "@/components/ui/StatCard";
import { TourCard } from "@/components/tours/TourCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { getSession } from "@/lib/auth/session";
import { repository } from "@/lib/data";
import { buildActivityFeed } from "@/lib/activity";

const todayLabel = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
}).format(new Date());

export default async function AgentDashboardPage() {
  const user = await getSession();
  if (!user || !user.agencyId) redirect("/login");

  const [requests, tours] = await Promise.all([
    repository.listRequests({ agencyId: user.agencyId }),
    repository.listTours(),
  ]);
  const stats = await repository.getDashboardStats(requests, { agencyId: user.agencyId });

  const activity = buildActivityFeed(requests);
  const popularTours = tours.filter((tour) => tour.isPopular).slice(0, 4);
  const featuredTours = popularTours.length > 0 ? popularTours : tours.slice(0, 2);

  return (
    <AgentShell title="Dashboard">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="mb-2 text-headline-lg font-headline-lg text-on-surface">
            Hoş Geldiniz, {user.name}
          </h3>
          <p className="text-body-lg text-on-surface-variant">Özet ekranı</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-1.5 text-label-sm font-label-sm text-on-surface-variant">
          <Icon name="calendar_today" className="text-[16px]" />
          {todayLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex flex-wrap justify-between gap-6 md:col-span-12">
          <div className="min-w-[240px] flex-1">
            <StatCard
              tone="highlight"
              icon="flight_takeoff"
              label="Aktif Taleplerim"
              value={stats.totalRequests}
            />
          </div>
          <div className="min-w-[240px] flex-1">
            <StatCard
              tone="highlight"
              icon="pending_actions"
              label="Bekleyen Taleplerim"
              value={stats.pendingRequests}
            />
          </div>
          <div className="min-w-[240px] flex-1">
            <StatCard
              tone="highlight"
              icon="verified_user"
              label="Onaylanan Taleplerim"
              value={stats.approvedTours}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 md:col-span-8">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md font-headline-md text-on-surface">Öne Çıkan Turlar</h3>
            <Link
              href="/agent/tur-katalogu"
              className="flex items-center gap-1 text-label-sm font-label-sm text-secondary hover:underline"
            >
              Tümünü Gör
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} basePath="/agent/tur-katalogu" />
            ))}
          </div>
        </div>

        <div className="md:col-span-4">
          <RecentActivity items={activity} />
        </div>
      </div>
    </AgentShell>
  );
}
