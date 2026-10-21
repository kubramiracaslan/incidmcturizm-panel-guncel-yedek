import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Icon } from "@/components/ui/Icon";
import { StatCard } from "@/components/ui/StatCard";
import { TourCard } from "@/components/tours/TourCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { getSession } from "@/lib/auth/session";
import { repository } from "@/lib/data";
import { buildActivityFeed } from "@/lib/activity";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";

const CURRENCY_ORDER: Currency[] = ["TRY", "USD", "EUR", "GBP"];

const todayLabel = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
}).format(new Date());

export default async function AdminDashboardPage() {
  const user = await getSession();

  const [stats, requests, tours] = await Promise.all([
    repository.getDashboardStats(),
    repository.listRequests(),
    repository.listTours(),
  ]);

  const activeRequests = stats.pendingRequests + stats.revisionRequests;
  const activity = buildActivityFeed(requests);
  const featuredTours = tours.slice(0, 2);
  const revenueLabel =
    stats.revenueByCurrency.length > 0
      ? CURRENCY_ORDER.map((currency) =>
          stats.revenueByCurrency.find((entry) => entry.currency === currency),
        )
          .filter((entry): entry is { currency: Currency; amount: number } => entry !== undefined)
          .map((entry) => formatMoney(entry.amount, entry.currency))
          .join(" + ")
      : formatMoney(0, "TRY");

  return (
    <AdminShell title="Dashboard">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="mb-2 text-headline-lg font-headline-lg text-on-surface">
            Hoş Geldiniz, {user?.name}
          </h3>
          <p className="text-body-lg text-on-surface-variant">Özet ekranı</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-1.5 text-label-sm font-label-sm text-on-surface-variant">
          <Icon name="calendar_today" className="text-[16px]" />
          {todayLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:col-span-12">
          <StatCard
            tone="highlight"
            icon="flight_takeoff"
            label="Toplam Aktif Talepler"
            value={activeRequests}
            hint="Onay bekleyen tüm acenteler"
          />
          <StatCard
            icon="pending_actions"
            label="Acil Bekleyen Talepler"
            value={stats.pendingRequests}
          />
          <StatCard
            icon="verified_user"
            label="Onaylanan Turlar"
            value={stats.approvedTours}
          />
          <StatCard
            icon="payments"
            label="Toplam Ciro"
            value={revenueLabel}
            hint="Onaylanan taleplerin toplamı"
          />
        </div>

        <div className="flex flex-col gap-6 md:col-span-8">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md font-headline-md text-on-surface">Öne Çıkan Turlar</h3>
            <Link
              href="/admin/tur-katalogu"
              className="flex items-center gap-1 text-label-sm font-label-sm text-secondary hover:underline"
            >
              Tümünü Gör
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} basePath="/admin/tur-katalogu" />
            ))}
          </div>
        </div>

        <div className="md:col-span-4">
          <RecentActivity items={activity} />
        </div>
      </div>
    </AdminShell>
  );
}
