import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { RequestStatsRow } from "@/components/requests/RequestStatsRow";
import { RequestStatusTabs } from "@/components/requests/RequestStatusTabs";
import { RequestsTable } from "@/components/requests/RequestsTable";
import {
  RequestsExportButton,
  RequestsFilterProvider,
  RequestsFilterToggleButton,
} from "@/components/requests/RequestsFilterContext";
import { repository } from "@/lib/data";
import { isOperationManagementConfigured } from "@/lib/integrations/operationManagement";
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
      <RequestsFilterProvider>
        <PageHeader
          title="Gelen Talepler"
          description="Tüm acentelerden gelen teklif taleplerini yönetin"
          actions={
            <>
              <RequestsFilterToggleButton />
              <RequestsExportButton />
            </>
          }
        />

        <RequestStatsRow stats={stats} />

        <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
          <RequestStatusTabs basePath="/admin/talepler" activeStatus={status ?? ""} />
          <RequestsTable
            requests={requests}
            showAgencyColumn
            interactive
            omConfigured={isOperationManagementConfigured()}
          />
        </div>
      </RequestsFilterProvider>
    </AdminShell>
  );
}
