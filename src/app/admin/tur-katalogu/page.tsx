import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilters } from "@/components/tours/TourFilters";
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
        actions={
          <Button
            variant="primary"
            icon="add"
            disabled
            title="Bu özellik henüz aktif değil"
            className="disabled:opacity-100"
          >
            Yeni Tur Ekle
            <span className="rounded-full bg-black/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-container">
              Yakında
            </span>
          </Button>
        }
      />
      <div className="flex flex-col gap-6 lg:flex-row">
        <TourFilters basePath="/admin/tur-katalogu" resultCount={tours.length} />
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 xl:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} basePath="/admin/tur-katalogu" />
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
