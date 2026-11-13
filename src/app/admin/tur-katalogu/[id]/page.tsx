import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TourDetailSummary } from "@/components/tours/TourDetailSummary";
import { TourInfoCard } from "@/components/tours/TourInfoCard";
import { GroupPriceTable } from "@/components/tours/GroupPriceTable";
import { TourProgramCard } from "@/components/tours/TourProgramCard";
import { TourEditButton } from "@/components/tours/TourFormModal";
import { DeleteTourButton } from "@/components/tours/DeleteTourButton";
import { TourStatusToggleButton } from "@/components/tours/TourStatusToggleButton";
import { repository } from "@/lib/data";
import { formatDate } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [tour, allRequests, editData, groupPrices, existingRegions] = await Promise.all([
    repository.getTourById(id),
    repository.listRequests(),
    repository.getTourForEdit(id),
    repository.getTourGroupPrices(id),
    repository.listTourRegions(),
  ]);
  if (!tour || !editData) notFound();

  const tourRequests = allRequests.filter((request) => request.tourId === tour.id);

  return (
    <AdminShell title="Tur Kataloğu">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
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
        <div className="flex items-center gap-3">
          <TourStatusToggleButton id={tour.id} isActive={tour.isActive} />
          <TourEditButton tourId={tour.id} initialData={editData} existingRegions={existingRegions} />
          <DeleteTourButton id={tour.id} name={tour.name} />
        </div>
      </div>

      {/*
        Two independent columns, each sized to its own content (no shared
        grid rows — that caused dead whitespace whenever one column's cards
        added up to a different height than the other's). On mobile each
        column wrapper collapses to `contents` so its cards become direct
        children of the outer flex-col and the `order-*` classes below
        control the single-column reading order; at `lg:` the wrapper
        becomes a real flex column again and lays its own cards out with a
        fixed gap, independent of the other column's height.
      */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="contents lg:flex lg:basis-0 lg:grow-[5] lg:flex-col lg:gap-6">
          <div className="order-1">
            <TourDetailSummary tour={tour} />
          </div>
          <div className="order-4">
            <TourInfoCard
              title="Dahil Olanlar"
              headerIcon="check_circle"
              headerColorClass="text-secondary"
              itemIcon="done"
              itemColorClass="text-secondary"
              items={tour.includes}
            />
          </div>
          <div className="order-5">
            <TourInfoCard
              title="Dahil Olmayanlar"
              headerIcon="cancel"
              headerColorClass="text-error"
              itemIcon="close"
              itemColorClass="text-error"
              items={tour.excludes}
            />
          </div>
          {tour.importantNotes.length > 0 && (
            <div className="order-6">
              <TourInfoCard
                title="Önemli Noktalar"
                headerIcon="info"
                headerColorClass="text-tertiary"
                itemIcon="error"
                itemColorClass="text-tertiary"
                items={tour.importantNotes}
              />
            </div>
          )}
        </div>

        <div className="contents lg:flex lg:basis-0 lg:grow-[7] lg:flex-col lg:gap-6">
          <div className="order-2">
            <TourProgramCard days={editData.dailyPrograms} />
          </div>

          <div className="order-3">
            {groupPrices.length === 0 ? (
              <div className="rounded-xl border border-outline-variant bg-primary-container p-6">
                <h3 className="mb-2 text-headline-sm font-headline-sm font-bold text-on-surface">Grup Fiyatları</h3>
                <p className="text-sm text-on-surface-variant">Henüz grup fiyatı girilmedi.</p>
              </div>
            ) : (
              <GroupPriceTable rows={groupPrices} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
        <div className="border-b border-white/5 px-6 py-4">
          <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Bu Tura Gelen Talepler</h3>
          <p className="text-xs text-on-surface-variant">{tourRequests.length} talep bulundu</p>
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
    </AdminShell>
  );
}
