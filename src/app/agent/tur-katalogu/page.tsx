import { AgentShell } from "@/components/layout/AgentShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilters } from "@/components/tours/TourFilters";
import { repository } from "@/lib/data";

interface PageProps {
  searchParams: Promise<{ region?: string; q?: string }>;
}

export default async function AgentTourCatalogPage({ searchParams }: PageProps) {
  const { region, q } = await searchParams;
  const tours = await repository.listTours({ region, search: q });

  return (
    <AgentShell title="Tur Kataloğu">
      <PageHeader
        title="Turlar"
        description="Acenteniz için en uygun komisyon oranlı paketler"
      />
      <div className="flex flex-col gap-6 lg:flex-row">
        <TourFilters basePath="/agent/tur-katalogu" resultCount={tours.length} />
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 xl:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} basePath="/agent/tur-katalogu" />
            ))}
          </div>
        </div>
      </div>
    </AgentShell>
  );
}
