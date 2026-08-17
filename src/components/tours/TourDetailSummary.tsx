import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { Tour } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function TourDetailSummary({ tour }: { tour: Tour }) {
  return (
    <div className="glass-panel relative flex flex-col overflow-hidden rounded-xl p-1">
      <div className="relative h-64 overflow-hidden rounded-lg">
        <Image src={tour.coverImage} alt={tour.name} fill unoptimized className="object-cover" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full border border-outline-variant bg-surface-deep/80 px-3 py-1 text-label-sm font-label-sm uppercase text-on-surface backdrop-blur-sm">
            {tour.region}
          </span>
        </div>
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-brand px-3 py-1 text-label-sm font-label-sm font-bold text-primary-container shadow-md">
            {tour.nights} GECE {tour.days} GÜN
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-deep via-surface-deep/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="mb-1 text-headline-md font-headline-md font-bold text-on-surface">
            {tour.name}
          </h3>
          <p className="line-clamp-2 text-body-md font-body-md text-on-surface-variant">
            {tour.description}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-outline-variant/50 bg-surface-container p-4">
            <div className="mb-1 text-label-sm font-label-sm text-on-surface-variant">
              BAŞLANGIÇ FİYATI
            </div>
            <div className="text-headline-md font-headline-md font-bold text-secondary">
              {formatMoney(tour.startingPrice, tour.currency)}
            </div>
          </div>
          <div className="rounded-lg border border-outline-variant/50 bg-surface-container p-4">
            <div className="mb-1 text-label-sm font-label-sm text-on-surface-variant">
              KONTENJAN
            </div>
            <div className="text-headline-md font-headline-md font-bold text-on-surface">
              {tour.capacity} Kişi
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {tour.highlights.map((highlight) => (
            <div key={highlight.title} className="flex items-start gap-3">
              <Icon name={highlight.icon} className="mt-0.5 text-secondary" />
              <div>
                <div className="text-table-data font-table-data text-on-surface">
                  {highlight.title}
                </div>
                <div className="text-label-sm font-label-sm text-on-surface-variant">
                  {highlight.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
