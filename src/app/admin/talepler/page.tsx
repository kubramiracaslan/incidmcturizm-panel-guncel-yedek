import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { RequestStatsRow } from "@/components/requests/RequestStatsRow";
import { RequestStatusTabs } from "@/components/requests/RequestStatusTabs";
import { RequestsTable } from "@/components/requests/RequestsTable";
import { repository } from "@/lib/data";
import type { RequestStatus } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminRequestsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const stats = await repository.getDashboardStats();
  const requests = await repository.listRequests({
    status: status as RequestStatus | undefined,
  });

  return (
    <AdminShell title="Talepler">
      <PageHeader
        title="Gelen Talepler"
        description="Tüm acentelerden gelen teklif taleplerini yönetin"
        actions={
          <>
            <Button variant="secondary" icon="filter_list">
              Filtrele
            </Button>
            <Button variant="secondary" icon="download">
              Dışa Aktar
            </Button>
          </>
        }
      />

      <RequestStatsRow stats={stats} />

      <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
        <RequestStatusTabs basePath="/admin/talepler" activeStatus={status ?? ""} />
        <RequestsTable requests={requests} showAgencyColumn interactive />
      </div>
    </AdminShell>
  );
}
