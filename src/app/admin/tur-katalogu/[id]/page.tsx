import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TourDetailSummary } from "@/components/tours/TourDetailSummary";
import { TourInfoCard } from "@/components/tours/TourInfoCard";
import { repository } from "@/lib/data";
import { formatDate } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [tour, allRequests] = await Promise.all([
    repository.getTourById(id),
    repository.listRequests(),
  ]);
  if (!tour) notFound();

  const tourRequests = allRequests.filter((request) => request.tourId === tour.id);

  return (
    <AdminShell title="Tur Kataloğu">
      <div className="mb-8">
        <Link
          href="/admin/tur-katalogu"
          className="mb-4 inline-flex items-center text-body-md text-on-surface-variant transition-colors hover:text-secondary"
        >
          <Icon name="arrow_back" className="mr-1 text-sm" />
          Turlara Dön
        </Link>
        <h1 className="mb-2 text-display-lg font-display-lg text-on-surface">{tour.name}</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant">
          Tur detaylarını görüntüleyin ve bu tura gelen talepleri inceleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <TourDetailSummary tour={tour} />
          <TourInfoCard
            title="Dahil Olanlar"
            headerIcon="check_circle"
            headerColorClass="text-secondary"
            itemIcon="done"
            itemColorClass="text-secondary"
            items={tour.includes}
          />
          <TourInfoCard
            title="Dahil Olmayanlar"
            headerIcon="cancel"
            headerColorClass="text-error"
            itemIcon="close"
            itemColorClass="text-error"
            items={tour.excludes}
          />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="rounded-xl border border-outline-variant bg-primary-container p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                Tur Yönetimi
              </h3>
              <Button variant="secondary" icon="edit">
                Turu Düzenle
              </Button>
            </div>
            <p className="text-sm text-on-surface-variant">
              Tur içeriği, fiyat ve kontenjan güncellemeleri; site geliştiricisinin teslim
              edeceği yönetim panelinden yapılacaktır. Bu ekran şimdilik salt görüntüleme
              amaçlıdır.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
            <div className="border-b border-white/5 px-6 py-4">
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                Bu Tura Gelen Talepler
              </h3>
              <p className="text-xs text-on-surface-variant">
                {tourRequests.length} talep bulundu
              </p>
            </div>
            <div className="divide-y divide-white/5">
              {tourRequests.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-on-surface-variant">
                  Bu tur için henüz bir talep oluşturulmadı.
                </p>
              )}
              {tourRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-mono text-sm text-primary/80">#{request.id}</p>
                    <p className="text-sm text-on-surface">{request.agencyName}</p>
                    <p className="text-xs text-on-surface-variant">
                      {formatDate(request.startDate)} · {request.adults + request.children} kişi
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
