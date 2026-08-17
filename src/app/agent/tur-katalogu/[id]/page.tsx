import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentShell } from "@/components/layout/AgentShell";
import { Icon } from "@/components/ui/Icon";
import { TourDetailSummary } from "@/components/tours/TourDetailSummary";
import { TourInfoCard } from "@/components/tours/TourInfoCard";
import { RequestForm } from "@/components/requests/RequestForm";
import { repository } from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentTourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tour = await repository.getTourById(id);
  if (!tour) notFound();

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
          <TourInfoCard
            title="Önemli Noktalar"
            headerIcon="info"
            headerColorClass="text-tertiary"
            itemIcon="error"
            itemColorClass="text-tertiary"
            items={tour.importantNotes}
          />
        </div>

        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <RequestForm tour={tour} cancelHref="/agent/tur-katalogu" />
          </div>
        </div>
      </div>
    </AgentShell>
  );
}
