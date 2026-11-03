import { redirect } from "next/navigation";
import { AgentShell } from "@/components/layout/AgentShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmedToursTable } from "@/components/tours/ConfirmedToursTable";
import { getSession } from "@/lib/auth/session";
import { repository } from "@/lib/data";

export default async function AgentConfirmedToursPage() {
  const user = await getSession();
  if (!user || !user.agencyId) redirect("/login");

  const requests = await repository.listRequests({
    agencyId: user.agencyId,
    status: "onaylandi",
  });
  const upcoming = [...requests].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return (
    <AgentShell title="Turlarım">
      <PageHeader
        title="Turlarım"
        description={`${user.agencyName} adına onaylanıp tura dönüşen ${upcoming.length} talep.`}
      />

      <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
        <ConfirmedToursTable requests={upcoming} amountColumnLabel="Tahmini Tutar" />
      </div>
    </AgentShell>
  );
}
