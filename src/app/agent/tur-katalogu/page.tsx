import { AgentShell } from "@/components/layout/AgentShell";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilters } from "@/components/tours/TourFilters";
import { repository } from "@/lib/data";

interface PageProps {
  searchParams: Promise<{ region?: string; q?: string }>;
}

export default async function AgentTourCatalogPage({ searchParams }: PageProps) {
  const { region, q } = await searchParams;
  const [tours, regions] = await Promise.all([
    repository.listTours({ region, search: q }),
    repository.listTourRegions(),
  ]);

  return (
    <AgentShell title="Tur Kataloğu">
      <PageHeader
        title="Turlar"
        description="Acenteniz için en uygun komisyon oranlı paketler"
      />
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
        <Icon name="info" className="text-[18px]" />
        Talep oluşturmak için bir tur seçin.
      </div>
      <TourFilters basePath="/agent/tur-katalogu" resultCount={tours.length} regions={regions} />
      <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} basePath="/agent/tur-katalogu" />
        ))}
      </div>
    </AgentShell>
  );
}
