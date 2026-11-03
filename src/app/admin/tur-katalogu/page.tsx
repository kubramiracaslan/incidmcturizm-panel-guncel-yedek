import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilters } from "@/components/tours/TourFilters";
import { NewTourForm } from "@/components/tours/TourFormModal";
import { repository } from "@/lib/data";

interface PageProps {
  searchParams: Promise<{ region?: string; q?: string }>;
}

export default async function AdminTourCatalogPage({ searchParams }: PageProps) {
  const { region, q } = await searchParams;
  const tours = await repository.listTours({ region, search: q });

  return (
    <AdminShell title="Tur Kataloğu">
      <PageHeader
        title="Tur Kataloğu"
        description="Acentelerin gördüğü katalog görünümü"
        actions={<NewTourForm />}
      />
      <TourFilters basePath="/admin/tur-katalogu" resultCount={tours.length} />
      <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} basePath="/admin/tur-katalogu" />
        ))}
      </div>
    </AdminShell>
  );
}
