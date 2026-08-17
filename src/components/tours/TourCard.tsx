import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Tour } from "@/lib/types";
import { formatMoney } from "@/lib/format";

interface TourCardProps {
  tour: Tour;
  basePath: string;
}

export function TourCard({ tour, basePath }: TourCardProps) {
  return (
    <div className="group relative flex h-[420px] flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container transition-all hover:-translate-y-0.5 hover:border-mint-glow/50 hover:shadow-[0_0_15px_rgba(78,222,163,0.2)]">
      <div className="absolute inset-0 z-0">
        <Image
          src={tour.coverImage}
          alt={tour.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(0,26,21,0) 0%, rgba(0,26,21,0.9) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex justify-between p-4">
        <span className="rounded-full border border-outline-variant/30 bg-surface/50 px-3 py-1 text-[10px] font-label-sm uppercase tracking-wider text-on-surface backdrop-blur-md">
          {tour.region}
        </span>
        <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-label-sm font-bold uppercase tracking-wider text-primary-container shadow-lg">
          {tour.nights} Gece {tour.days} Gün
        </span>
      </div>

      <div className="relative z-10 mt-auto border-t border-outline-variant/20 bg-surface-deep/60 p-5 backdrop-blur-sm">
        <h3 className="mb-2 text-headline-md font-headline-md font-bold leading-tight text-white">
          {tour.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-table-data text-on-surface-variant">
          {tour.summary}
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-1 text-[10px] font-label-sm uppercase tracking-wider text-on-surface-variant">
              Başlangıç Fiyatı
            </p>
            <p className="text-headline-md font-headline-md font-bold text-secondary">
              {formatMoney(tour.startingPrice, tour.currency)}
            </p>
          </div>
          <Link
            href={`${basePath}/${tour.id}`}
            className="flex items-center gap-1 rounded-lg border border-outline-variant bg-surface/80 px-3 py-2 text-label-sm font-label-sm text-on-surface transition-colors hover:bg-surface group-hover:border-secondary/50"
          >
            Detaylar
            <Icon name="arrow_forward" className="text-[16px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
