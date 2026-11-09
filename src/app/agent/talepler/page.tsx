import { redirect } from "next/navigation";
import { AgentShell } from "@/components/layout/AgentShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { RequestStatsRow } from "@/components/requests/RequestStatsRow";
import { RequestStatusTabs } from "@/components/requests/RequestStatusTabs";
import { RequestsTable } from "@/components/requests/RequestsTable";
import {
  RequestsExportButton,
  RequestsFilterProvider,
  RequestsFilterToggleButton,
} from "@/components/requests/RequestsFilterContext";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { repository } from "@/lib/data";
import type { RequestStatus } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ status?: string; created?: string }>;
}

export default async function AgentRequestsPage({ searchParams }: PageProps) {
  const { status, created } = await searchParams;
  const user = await getSession();
  if (!user || !user.agencyId) redirect("/login");

  const [allAgencyRequests, requests] = await Promise.all([
    repository.listRequests({ agencyId: user.agencyId }),
    repository.listRequests({ agencyId: user.agencyId, status: status as RequestStatus | undefined }),
  ]);
  const stats = await repository.getDashboardStats(allAgencyRequests, { agencyId: user.agencyId });

  return (
    <AgentShell title="Taleplerim">
      <RequestsFilterProvider>
        <PageHeader
          title="Taleplerim"
          description={`${user.agencyName} adına gönderilen teklif talepleri`}
          actions={
            <>
              <RequestsFilterToggleButton />
              <RequestsExportButton />
              <Button href="/agent/tur-katalogu" icon="add">
                Yeni Talep Oluştur
              </Button>
            </>
          }
        />

        {created && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
            <span className="font-mono">#{created}</span>
            numaralı talebiniz oluşturuldu ve İnci DMC ekibine iletildi.
          </div>
        )}

        <RequestStatsRow stats={stats} />

        <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
          <RequestStatusTabs basePath="/agent/talepler" activeStatus={status ?? ""} />
          <RequestsTable requests={requests} amountColumnLabel="Tahmini Tutar" />
        </div>
      </RequestsFilterProvider>
    </AgentShell>
  );
}
