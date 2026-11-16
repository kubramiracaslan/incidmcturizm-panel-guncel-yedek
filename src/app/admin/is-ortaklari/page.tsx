import Image from "next/image";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { PartnerCreateButton } from "@/components/home/PartnerCreateButton";
import { PartnerEditButton } from "@/components/home/PartnerEditButton";
import { PartnerDeleteButton } from "@/components/home/PartnerDeleteButton";
import { repository } from "@/lib/data";

function SectionCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-primary-container p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded border border-secondary/20 bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary">
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center rounded border border-outline-variant bg-surface-variant px-2 py-1 text-xs font-medium text-on-surface-variant">
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      Pasif
    </span>
  );
}

export default async function AdminPartnersPage() {
  const overview = await repository.getHomePageOverview();

  return (
    <AdminShell title="İş Ortakları Yönetimi">
      <PageHeader
        title="İş Ortakları Yönetimi"
        description="Sitedeki iş ortağı logolarını yönetin (anasayfadaki kayan şerit ve İş Ortaklarımız sayfası)"
      />

      <div className="flex flex-col gap-6">
        <SectionCard title="İş Ortakları" action={<PartnerCreateButton />}>
          {overview.partners.length === 0 ? (
            <p className="text-sm text-on-surface-variant">İş ortağı bulunamadı.</p>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {overview.partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface-container p-2.5"
                  >
                    {partner.logoUrl ? (
                      <div className="relative h-8 w-full">
                        <Image
                          src={partner.logoUrl}
                          alt={partner.name}
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <Icon name="business" className="text-2xl text-on-surface-variant" />
                    )}
                    <p className="w-full truncate text-center text-[10px] text-on-surface-variant">
                      {partner.name}
                    </p>
                    <ActiveBadge active={partner.isActive} />
                    <div className="flex items-center gap-0.5">
                      <PartnerEditButton partner={partner} />
                      <PartnerDeleteButton id={partner.id} name={partner.name} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </AdminShell>
  );
}
