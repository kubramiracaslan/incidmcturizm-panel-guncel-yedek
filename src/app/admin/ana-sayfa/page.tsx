import Image from "next/image";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { TourCard } from "@/components/tours/TourCard";
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

function ComingSoonButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Yakında"
      className="inline-flex shrink-0 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-brand/40 px-3 py-1.5 text-xs font-semibold text-primary-container/70"
    >
      {label}
      <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider">Yakında</span>
    </button>
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

export default async function AdminHomePageManagement() {
  const overview = await repository.getHomePageOverview();

  return (
    <AdminShell title="Ana Sayfa Yönetimi">
      <PageHeader
        title="Ana Sayfa Yönetimi"
        description="Sitenin ana sayfasında gösterilen içeriklerin mevcut durumu — şimdilik salt görüntüleme amaçlıdır"
      />

      <div className="flex flex-col gap-6">
        <SectionCard title="Logo" action={<ComingSoonButton label="Değiştir" />}>
          {overview.logo?.logoUrl ? (
            <div className="relative h-16 w-40 overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container">
              <Image
                src={overview.logo.logoUrl}
                alt="Site logosu"
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Logo yüklenmemiş.</p>
          )}
        </SectionCard>

        <SectionCard title="Hero Banner" action={<ComingSoonButton label="Düzenle" />}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {overview.hero?.imageUrl ? (
              <div className="relative h-48 overflow-hidden rounded-lg border border-outline-variant/30">
                <Image src={overview.hero.imageUrl} alt="Hero görseli" fill unoptimized className="object-cover" />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-outline-variant/50 text-sm text-on-surface-variant">
                Hero görseli yüklenmemiş
              </div>
            )}
            <div>
              <p className="mb-1 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                Başlık
              </p>
              <p className="mb-4 text-headline-sm font-headline-sm font-bold text-on-surface">
                {overview.hero?.title || "—"}
              </p>
              <p className="mb-1 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                Alt Başlık
              </p>
              <p className="text-sm text-on-surface-variant">{overview.hero?.subtitle || "—"}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Öne Çıkan Turlar" action={<ComingSoonButton label="Ayarları Düzenle" />}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-headline-sm font-headline-sm font-bold text-on-surface">
                {overview.featuredSection?.title || "—"}
              </p>
              <p className="mb-1 text-sm font-medium text-secondary">{overview.featuredSection?.subtitle}</p>
              <p className="max-w-2xl text-sm text-on-surface-variant">
                {overview.featuredSection?.description}
              </p>
            </div>
            <ActiveBadge active={overview.featuredSection?.isActive ?? false} />
          </div>
          {overview.featuredTours.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Öne çıkan olarak işaretlenmiş tur yok.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {overview.featuredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} basePath="/admin/tur-katalogu" />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Bilgilendirmeler" action={<ComingSoonButton label="Yeni Ekle" />}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse whitespace-nowrap text-left">
              <thead>
                <tr className="border-b border-white/10 bg-surface-deep/50">
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    İkon
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Ad
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Kısa Açıklama
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Sıra
                  </th>
                  <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-table-data font-table-data">
                {overview.services.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-on-surface-variant">
                      Bilgilendirme içeriği bulunamadı.
                    </td>
                  </tr>
                )}
                {overview.services.map((service, index) => (
                  <tr
                    key={service.id}
                    className={index % 2 === 1 ? "bg-white/[0.02]" : ""}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center text-secondary [&_svg]:h-6 [&_svg]:w-6"
                        dangerouslySetInnerHTML={{ __html: service.iconSvg }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-on-surface">{service.name}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-on-surface-variant">
                      {service.shortDescription}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{service.displayOrder}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={service.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Harita" action={<ComingSoonButton label="Konum Ekle" />}>
          <p className="mb-4 text-sm text-on-surface-variant">
            {overview.map?.title} {overview.map?.subtitle ? `· ${overview.map.subtitle}` : ""}
          </p>
          {overview.map?.imageUrl ? (
            <div className="relative mb-5 h-80 w-full overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-deep">
              <Image src={overview.map.imageUrl} alt="Harita" fill unoptimized className="object-contain" />
              {overview.mapLocations.map((loc) => (
                <div
                  key={loc.id}
                  title={loc.name}
                  className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ${
                    loc.isActive ? "bg-secondary" : "bg-on-surface-variant"
                  }`}
                  style={{ left: `${loc.xPosition}%`, top: `${loc.yPosition}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="mb-5 flex h-80 items-center justify-center rounded-lg border border-dashed border-outline-variant/50 text-sm text-on-surface-variant">
              Harita görseli yüklenmemiş
            </div>
          )}
          {overview.mapLocations.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Haritada işaretli konum yok.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overview.mapLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-outline-variant/50 bg-surface-container p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-on-surface">{loc.name}</p>
                    {loc.description && (
                      <p className="truncate text-xs text-on-surface-variant">{loc.description}</p>
                    )}
                  </div>
                  <ActiveBadge active={loc.isActive} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="İstatistikler" action={<ComingSoonButton label="Yeni Ekle" />}>
          {overview.stats.length === 0 ? (
            <p className="text-sm text-on-surface-variant">İstatistik bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overview.stats.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-lg border border-outline-variant/50 bg-surface-container p-4"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center text-secondary [&_svg]:h-8 [&_svg]:w-8"
                      dangerouslySetInnerHTML={{ __html: stat.iconSvg }}
                    />
                    <ActiveBadge active={stat.isActive} />
                  </div>
                  <p className="text-headline-md font-headline-md font-bold text-on-surface">{stat.value}</p>
                  <p className="text-sm font-medium text-on-surface">{stat.label}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{stat.description}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="İş Ortakları" action={<ComingSoonButton label="Yeni Ekle" />}>
          {overview.partners.length === 0 ? (
            <p className="text-sm text-on-surface-variant">İş ortağı bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {overview.partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex flex-col items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container p-4"
                >
                  {partner.logoUrl ? (
                    <div className="relative h-12 w-full">
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Icon name="business" className="text-3xl text-on-surface-variant" />
                  )}
                  <p className="truncate text-xs text-on-surface-variant">{partner.name}</p>
                  <ActiveBadge active={partner.isActive} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AdminShell>
  );
}
