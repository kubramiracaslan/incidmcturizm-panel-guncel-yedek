import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmedToursTable } from "@/components/tours/ConfirmedToursTable";
import { repository } from "@/lib/data";

export default async function AdminConfirmedToursPage() {
  const requests = await repository.listRequests({ status: "onaylandi" });
  const upcoming = [...requests].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return (
    <AdminShell title="Turlar">
      <PageHeader
        title="Turlar"
        description={`Onaylanıp tura dönüşen ${upcoming.length} talep — hangi acentenin hangi tura, ne zaman ve kaç kişiyle katılacağını görüntüleyin.`}
      />

      <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
        <ConfirmedToursTable requests={upcoming} showAgencyColumn />
      </div>
    </AdminShell>
  );
}
