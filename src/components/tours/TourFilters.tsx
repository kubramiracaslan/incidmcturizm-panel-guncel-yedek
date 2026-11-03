"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";

const regions = ["Balkanlar", "Avrupa", "Asya", "Afrika", "Avustralya"];

/** Tek satırlık yatay filtre çubuğu — turların üstünde, tam genişlikte. */
export function TourFilters({ basePath, resultCount }: { basePath: string; resultCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [region, setRegion] = useState(searchParams.get("region") ?? "");

  function applyFilters(nextRegion: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextRegion) {
      params.set("region", nextRegion);
    } else {
      params.delete("region");
    }
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant/30 bg-primary-container px-5 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-body-md font-headline-md font-semibold text-primary">
        <Icon name="filter_list" className="text-secondary" />
        Filtrele
      </div>

      <div className="relative">
        <Icon
          name="public"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant"
        />
        <select
          value={region}
          disabled={isPending}
          onChange={(event) => {
            setRegion(event.target.value);
            applyFilters(event.target.value);
          }}
          className="w-48 appearance-none rounded-lg border border-outline-variant bg-surface-deep py-2 pl-9 pr-8 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
        >
          <option value="">Tüm Destinasyonlar</option>
          {regions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant"
        />
      </div>

      {region && (
        <button
          type="button"
          onClick={() => {
            setRegion("");
            applyFilters("");
          }}
          className="text-label-sm font-label-sm text-on-surface-variant transition-colors hover:text-secondary"
        >
          Temizle
        </button>
      )}

      <p className="ml-auto text-label-sm font-label-sm text-on-surface-variant">
        {resultCount} sonuç bulundu
      </p>
    </div>
  );
}
