"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";

const regions = ["Balkanlar", "Avrupa", "Asya", "Afrika", "Avustralya"];

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
    <aside className="hidden w-72 shrink-0 space-y-6 lg:block">
      <div className="relative overflow-hidden rounded-xl border border-outline-variant/30 bg-primary-container p-5 shadow-lg">
        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h3 className="flex items-center gap-2 text-body-lg font-headline-md font-semibold text-primary">
              <Icon name="filter_list" className="text-secondary" />
              Filtrele
            </h3>
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
          </div>

          <div className="space-y-3">
            <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
              Destinasyon
            </label>
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
                className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-deep py-2 pl-9 pr-8 text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
              >
                <option value="">Tümü</option>
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
          </div>

          <p className="mt-6 text-label-sm font-label-sm text-on-surface-variant">
            {resultCount} sonuç bulundu
          </p>
        </div>
      </div>
    </aside>
  );
}
