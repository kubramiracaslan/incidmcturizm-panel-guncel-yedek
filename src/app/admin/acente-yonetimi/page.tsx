import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { AgencyStatusBadge } from "@/components/agencies/AgencyStatusBadge";
import { AgencyStatusTabs } from "@/components/agencies/AgencyStatusTabs";
import { AgencyActionsMenu } from "@/components/agencies/AgencyActionsMenu";
import { AgencyEditButton } from "@/components/agencies/AgencyEditButton";
import { AgencyCreateButton } from "@/components/agencies/AgencyCreateButton";
import { repository } from "@/lib/data";
import type { AgencyStatus } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminAgenciesPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const [agencies, requests] = await Promise.all([
    repository.listAgencies({ status: status as AgencyStatus | undefined }),
    repository.listRequests(),
  ]);

  return (
    <AdminShell title="Acente Yönetimi">
      <PageHeader
        title="Acente Yönetimi"
        description="Platforma kayıtlı acenteleri görüntüleyin ve yönetin"
        actions={<AgencyCreateButton />}
      />

      <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
        <AgencyStatusTabs basePath="/admin/acente-yonetimi" activeStatus={status ?? ""} />

        {agencies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-on-surface-variant">
            <Icon name="inbox" className="text-4xl" />
            <p>Kayıt bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse whitespace-nowrap text-left">
              <thead>
                <tr className="border-b border-white/10 bg-surface-deep/50">
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Acente
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Yetkili
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    E-posta
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Telefon
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Talep Sayısı
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Durum
                  </th>
                  <th className="w-48 px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Durumu Değiştir
                  </th>
                  <th className="w-20 px-4 py-3 text-center text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Kaydı Düzenle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-table-data font-table-data">
                {agencies.map((agency, index) => {
                  const requestCount = requests.filter((r) => r.agencyId === agency.id).length;
                  return (
                    <tr
                      key={agency.id}
                      className={`group transition-all hover:border-l hover:border-mint-glow hover:bg-surface-variant/30 ${
                        index % 2 === 1 ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-on-surface transition-colors group-hover:text-primary">
                          {agency.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{agency.contactName}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{agency.email}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{agency.phone}</td>
                      <td className="px-4 py-3 text-on-surface">{requestCount}</td>
                      <td className="px-4 py-3">
                        <AgencyStatusBadge status={agency.status} />
                      </td>
                      <td className="w-48 px-4 py-3">
                        <AgencyActionsMenu
                          agencyId={agency.id}
                          agencyName={agency.name}
                          currentStatus={agency.status}
                        />
                      </td>
                      <td className="w-20 px-4 py-3 text-center">
                        <AgencyEditButton agency={agency} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
