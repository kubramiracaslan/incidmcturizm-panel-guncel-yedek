import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { NewAgencyButton } from "@/components/agencies/NewAgencyButton";
import { repository } from "@/lib/data";

export default async function AdminAgenciesPage() {
  const [agencies, requests] = await Promise.all([
    repository.listAgencies(),
    repository.listRequests(),
  ]);

  return (
    <AdminShell title="Acente Yönetimi">
      <PageHeader
        title="Acente Yönetimi"
        description="Platforma kayıtlı acenteleri görüntüleyin ve yönetin"
        actions={<NewAgencyButton />}
      />

      <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
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
                <th className="px-4 py-3 text-right text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  İşlem
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
                      {agency.status === "active" ? (
                        <span className="inline-flex items-center rounded border border-secondary/20 bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded border border-outline-variant bg-surface-variant px-2 py-1 text-xs font-medium text-on-surface-variant">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary">
                        <Icon name="more_vert" className="text-[20px]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
