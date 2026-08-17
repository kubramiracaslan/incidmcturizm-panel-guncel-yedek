"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { TeklifTalebi } from "@/lib/types";
import { formatMoney } from "@/lib/format";

interface ConfirmedToursTableProps {
  requests: TeklifTalebi[];
  showAgencyColumn?: boolean;
}

interface Filters {
  talepId: string;
  agencyName: string;
  tourName: string;
  paxMin: string;
  paxMax: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

const emptyFilters: Filters = {
  talepId: "",
  agencyName: "",
  tourName: "",
  paxMin: "",
  paxMax: "",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const filterInputClass =
  "w-full rounded border border-outline-variant bg-surface-deep px-2 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50 [color-scheme:dark]";

export function ConfirmedToursTable({
  requests,
  showAgencyColumn = false,
}: ConfirmedToursTableProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const agencyOptions = useMemo(
    () => Array.from(new Set(requests.map((r) => r.agencyName))).sort(),
    [requests],
  );
  const tourOptions = useMemo(
    () => Array.from(new Set(requests.map((r) => r.tourName))).sort(),
    [requests],
  );

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      const pax = request.adults + request.children;

      if (
        filters.talepId &&
        !request.id.toLowerCase().includes(filters.talepId.toLowerCase())
      ) {
        return false;
      }
      if (filters.agencyName && request.agencyName !== filters.agencyName) return false;
      if (filters.tourName && request.tourName !== filters.tourName) return false;
      if (filters.paxMin && pax < Number(filters.paxMin)) return false;
      if (filters.paxMax && pax > Number(filters.paxMax)) return false;
      if (filters.dateFrom && request.startDate < filters.dateFrom) return false;
      if (filters.dateTo && request.startDate > filters.dateTo) return false;
      if (filters.amountMin && request.amount < Number(filters.amountMin)) return false;
      if (filters.amountMax && request.amount > Number(filters.amountMax)) return false;
      return true;
    });
  }, [requests, filters]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-on-surface-variant">
        <Icon name="inbox" className="text-4xl" />
        <p>Kayıt bulunamadı.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <span className="text-xs text-on-surface-variant">
          {filtered.length} / {requests.length} kayıt gösteriliyor
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => setFilters(emptyFilters)}
            className="flex items-center gap-1 text-xs text-secondary transition-colors hover:underline"
          >
            <Icon name="filter_alt_off" className="text-[14px]" />
            Filtreleri Temizle
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse whitespace-nowrap text-left">
          <thead>
            <tr className="border-b border-white/10 bg-surface-deep/50">
              <th className="px-4 py-3 text-center text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Talep ID
              </th>
              {showAgencyColumn && (
                <th className="px-4 py-3 text-center text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Acente Adı
                </th>
              )}
              <th className="px-4 py-3 text-center text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Tur Adı
              </th>
              <th className="px-4 py-3 text-center text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Pax
              </th>
              <th className="px-4 py-3 text-center text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Tarih
              </th>
              <th className="px-4 py-3 text-center text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Tutar
              </th>
            </tr>
            <tr className="border-b border-white/10 bg-surface-deep/30">
              <th className="px-4 py-2 text-center">
                <input
                  type="text"
                  value={filters.talepId}
                  onChange={(e) => setFilter("talepId", e.target.value)}
                  placeholder="Ara..."
                  className={filterInputClass}
                />
              </th>
              {showAgencyColumn && (
                <th className="px-4 py-2 text-center">
                  <select
                    value={filters.agencyName}
                    onChange={(e) => setFilter("agencyName", e.target.value)}
                    className={filterInputClass}
                  >
                    <option value="">Tümü</option>
                    {agencyOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </th>
              )}
              <th className="px-4 py-2 text-center">
                <select
                  value={filters.tourName}
                  onChange={(e) => setFilter("tourName", e.target.value)}
                  className={filterInputClass}
                >
                  <option value="">Tümü</option>
                  {tourOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-2">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min={0}
                    value={filters.paxMin}
                    onChange={(e) => setFilter("paxMin", e.target.value)}
                    placeholder="Min"
                    className={`${filterInputClass} w-16`}
                  />
                  <span className="text-on-surface-variant">–</span>
                  <input
                    type="number"
                    min={0}
                    value={filters.paxMax}
                    onChange={(e) => setFilter("paxMax", e.target.value)}
                    placeholder="Maks"
                    className={`${filterInputClass} w-16`}
                  />
                </div>
              </th>
              <th className="px-4 py-2">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilter("dateFrom", e.target.value)}
                    className={`${filterInputClass} w-[126px]`}
                  />
                  <span className="text-on-surface-variant">–</span>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilter("dateTo", e.target.value)}
                    className={`${filterInputClass} w-[126px]`}
                  />
                </div>
              </th>
              <th className="px-4 py-2">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min={0}
                    value={filters.amountMin}
                    onChange={(e) => setFilter("amountMin", e.target.value)}
                    placeholder="Min"
                    className={`${filterInputClass} w-20`}
                  />
                  <span className="text-on-surface-variant">–</span>
                  <input
                    type="number"
                    min={0}
                    value={filters.amountMax}
                    onChange={(e) => setFilter("amountMax", e.target.value)}
                    placeholder="Maks"
                    className={`${filterInputClass} w-20`}
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-table-data font-table-data">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={showAgencyColumn ? 6 : 5}
                  className="px-4 py-10 text-center text-on-surface-variant"
                >
                  Filtrelere uyan kayıt bulunamadı.
                </td>
              </tr>
            )}
            {filtered.map((request, index) => (
              <tr
                key={request.id}
                className={`group transition-all hover:border-l hover:border-mint-glow hover:bg-surface-variant/30 ${
                  index % 2 === 1 ? "bg-white/[0.02]" : ""
                }`}
              >
                <td className="px-4 py-3 text-center font-mono text-primary/80">
                  #{request.id}
                </td>
                {showAgencyColumn && (
                  <td className="px-4 py-3 text-center text-on-surface">
                    {request.agencyName}
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded border border-outline-variant/50 bg-surface">
                      {request.tourImage ? (
                        <Image
                          src={request.tourImage}
                          alt={request.tourName}
                          width={32}
                          height={32}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Icon name="map" className="text-sm text-on-surface-variant" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-on-surface transition-colors group-hover:text-primary">
                      {request.tourName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-on-surface">
                  {request.adults + request.children}
                </td>
                <td className="px-4 py-3 text-center text-on-surface-variant">
                  {dateFormatter.format(new Date(request.startDate))}
                </td>
                <td className="px-4 py-3 text-center font-medium text-on-surface">
                  {formatMoney(request.amount, request.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
