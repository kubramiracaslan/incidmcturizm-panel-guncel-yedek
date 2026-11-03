import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentShell } from "@/components/layout/AgentShell";
import { Icon } from "@/components/ui/Icon";
import { TourDetailSummary } from "@/components/tours/TourDetailSummary";
import { TourInfoCard } from "@/components/tours/TourInfoCard";
import { GroupPriceTable } from "@/components/tours/GroupPriceTable";
import { TourProgramCard } from "@/components/tours/TourProgramCard";
import { RequestForm } from "@/components/requests/RequestForm";
import { repository } from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentTourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [tour, editData] = await Promise.all([repository.getTourById(id), repository.getTourForEdit(id)]);
  if (!tour) notFound();

  const dailyPrograms = editData?.dailyPrograms ?? [];
  const groupPrices = editData?.groupPrices ?? [];

  return (
    <AgentShell title="Teklif İste">
      <div className="mb-8">
        <Link
          href="/agent/tur-katalogu"
          className="mb-4 inline-flex items-center text-body-md text-on-surface-variant transition-colors hover:text-secondary"
        >
          <Icon name="arrow_back" className="mr-1 text-sm" />
          Turlara Dön
        </Link>
        <h1 className="mb-2 text-display-lg font-display-lg text-on-surface">Teklif İste</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant">
          Müşteriniz için {tour.name} turuna özel bir teklif talebi oluşturun.
        </p>
      </div>

      {/* Bkz. admin tur detay sayfasındaki aynı desenin yorumu — iki
         bağımsız sütun, mobilde `contents` + `order-*` ile tek sütuna iner. */}
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

          {groupPrices.length > 0 && (
            <div className="order-3">
              <GroupPriceTable rows={groupPrices} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <RequestForm tour={tour} cancelHref="/agent/tur-katalogu" />
      </div>
    </AgentShell>
  );
}
