import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentShell } from "@/components/layout/AgentShell";
import { Icon } from "@/components/ui/Icon";
import { TourDetailSummary } from "@/components/tours/TourDetailSummary";
import { TourInfoCard } from "@/components/tours/TourInfoCard";
import { GroupPriceTable } from "@/components/tours/GroupPriceTable";
import { TourProgramCard } from "@/components/tours/TourProgramCard";
import { RequestFormModal } from "@/components/requests/RequestFormModal";
import { getSession } from "@/lib/auth/session";
import { repository } from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentTourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [user, tour, editData] = await Promise.all([
    getSession(),
    repository.getTourById(id),
    repository.getTourForEdit(id),
  ]);
  // Pasif bir tur, katalogdan zaten gizlendiği gibi doğrudan adresle de
  // açılamamalı — aksi halde acente linki paylaşıp/elle yazıp talep
  // oluşturma formuna erişebilirdi.
  if (!tour || !tour.isActive) notFound();

  const dailyPrograms = editData?.dailyPrograms ?? [];
  const groupPrices = editData?.groupPrices ?? [];
  const agency = user?.agencyId ? await repository.getAgencyById(user.agencyId) : null;
  const canViewPrices = agency?.canViewPrices ?? false;

  return (
    <AgentShell title="Tur Kataloğu">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/agent/tur-katalogu"
            className="mb-4 inline-flex items-center text-body-md text-on-surface-variant transition-colors hover:text-secondary"
          >
            <Icon name="arrow_back" className="mr-1 text-sm" />
            Turlara Dön
          </Link>
          <h1 className="mb-2 text-display-lg font-display-lg text-on-surface">{tour.name}</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant">
            {tour.summary || "Tur detaylarını inceleyin ve talep oluşturun."}
          </p>
        </div>
        <RequestFormModal tour={tour} />
      </div>

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
        </div>

        <div className="contents lg:flex lg:basis-0 lg:grow-[7] lg:flex-col lg:gap-6">
          <div className="order-2">
            <TourProgramCard days={dailyPrograms} />
          </div>

          {canViewPrices && (
            <div className="order-3">
              {groupPrices.length > 0 ? (
                <GroupPriceTable rows={groupPrices} />
              ) : (
                <div className="rounded-xl border border-outline-variant bg-primary-container p-6">
                  <h3 className="mb-2 text-headline-sm font-headline-sm font-bold text-on-surface">Grup Fiyatları</h3>
                  <p className="text-sm text-on-surface-variant">
                    Bu tur için grup fiyatları henüz yayınlanmadı. Fiyat bilgisi için bizimle iletişime
                    geçebilirsiniz.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AgentShell>
  );
}
