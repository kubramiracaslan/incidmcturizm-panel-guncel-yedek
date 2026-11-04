"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { RequestStatus, TeklifTalebi } from "@/lib/types";
import { formatMoney, requestStatusLabels } from "@/lib/format";
import { OmSyncRetryButton } from "./OmSyncRetryButton";
import { RequestActionsMenu } from "./RequestActionsMenu";
import { useRequestsFilterVisibility } from "./RequestsFilterContext";

interface RequestsTableProps {
  requests: TeklifTalebi[];
  showAgencyColumn?: boolean;
  /** "Tutar" sütununun başlığı — admin'de "Tutar" (varsayılan), acente
   * sayfasında "Tahmini Tutar" (bkz. `/agent/talepler`'in geçtiği değer). */
  amountColumnLabel?: string;
  /** Admin can act on a request's status inline; agents can only view it. */
  interactive?: boolean;
  /** OM entegrasyonu (OPERATION_MANAGEMENT_BASE_URL/SECRET) sunucuda
   * yapılandırılmış mı — değilse OM aktarım uyarısı/"tekrar dene" düğmesi
   * hiç render edilmez (bkz. `isOperationManagementConfigured`). */
  omConfigured?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const statusOptions: { value: RequestStatus | ""; label: string }[] = [
  { value: "", label: "Tümü" },
  ...(Object.entries(requestStatusLabels) as [RequestStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

interface Filters {
  id: string;
  agencyName: string;
  tourName: string;
  paxMin: string;
  paxMax: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  status: RequestStatus | "";
}

const emptyFilters: Filters = {
  id: "",
  agencyName: "",
  tourName: "",
  paxMin: "",
  paxMax: "",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  status: "",
};

const filterInputClass =
  "w-full rounded-md border border-white/10 bg-surface px-2 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none";

function hasActiveFilters(filters: Filters): boolean {
  return Object.values(filters).some((value) => value !== "");
}

export function RequestsTable({
  requests,
  showAgencyColumn = false,
  amountColumnLabel = "Tutar",
  interactive = false,
  omConfigured = false,
}: RequestsTableProps) {
  const { visible: filtersVisible, setExportData } = useRequestsFilterVisibility();
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const agencyOptions = useMemo(() => {
    if (!showAgencyColumn) return [];
    return Array.from(new Set(requests.map((r) => r.agencyName))).sort();
  }, [requests, showAgencyColumn]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (filters.id && !request.id.toLowerCase().includes(filters.id.toLowerCase())) return false;
      if (showAgencyColumn && filters.agencyName && request.agencyName !== filters.agencyName) {
        return false;
      }
      if (
        filters.tourName &&
        !request.tourName.toLowerCase().includes(filters.tourName.toLowerCase())
      ) {
        return false;
      }
      const pax = request.adults + request.children;
      if (filters.paxMin && pax < Number(filters.paxMin)) return false;
      if (filters.paxMax && pax > Number(filters.paxMax)) return false;
      if (filters.dateFrom && request.startDate < filters.dateFrom) return false;
      if (filters.dateTo && request.startDate > filters.dateTo) return false;
      if (filters.amountMin && request.amount < Number(filters.amountMin)) return false;
      if (filters.amountMax && request.amount > Number(filters.amountMax)) return false;
      if (filters.status && request.status !== filters.status) return false;
      return true;
    });
  }, [requests, filters, showAgencyColumn]);

  useEffect(() => {
    setExportData(filteredRequests, showAgencyColumn);
  }, [filteredRequests, showAgencyColumn, setExportData]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse whitespace-nowrap text-left">
        <thead>
          <tr className="border-b border-white/10 bg-surface-deep/50">
            <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Talep ID
            </th>
            {showAgencyColumn && (
              <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Acente Adı
              </th>
            )}
            <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Tur Adı
            </th>
            <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Pax
            </th>
            <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Tarih
            </th>
            <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              {amountColumnLabel}
            </th>
            <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Durum
            </th>
            <th className="px-4 py-3 text-right text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              İşlem
            </th>
          </tr>
          {filtersVisible && (
            <tr className="border-b border-white/10 bg-surface-deep/30">
              <th className="px-4 py-2 font-normal normal-case">
                <input
                  type="text"
                  value={filters.id}
                  onChange={(e) => updateFilter("id", e.target.value)}
                  placeholder="Ara..."
                  className={filterInputClass}
                />
              </th>
              {showAgencyColumn && (
                <th className="px-4 py-2 font-normal normal-case">
                  <select
                    value={filters.agencyName}
                    onChange={(e) => updateFilter("agencyName", e.target.value)}
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
              <th className="px-4 py-2 font-normal normal-case">
                <input
                  type="text"
                  value={filters.tourName}
                  onChange={(e) => updateFilter("tourName", e.target.value)}
                  placeholder="Ara..."
                  className={filterInputClass}
                />
              </th>
              <th className="px-4 py-2 font-normal normal-case">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    value={filters.paxMin}
                    onChange={(e) => updateFilter("paxMin", e.target.value)}
                    placeholder="Min"
                    className={filterInputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    value={filters.paxMax}
                    onChange={(e) => updateFilter("paxMax", e.target.value)}
                    placeholder="Max"
                    className={filterInputClass}
                  />
                </div>
              </th>
              <th className="px-4 py-2 font-normal normal-case">
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter("dateFrom", e.target.value)}
                    className={filterInputClass}
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter("dateTo", e.target.value)}
                    className={filterInputClass}
                  />
                </div>
              </th>
              <th className="px-4 py-2 font-normal normal-case">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    value={filters.amountMin}
                    onChange={(e) => updateFilter("amountMin", e.target.value)}
                    placeholder="Min"
                    className={filterInputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    value={filters.amountMax}
                    onChange={(e) => updateFilter("amountMax", e.target.value)}
                    placeholder="Max"
                    className={filterInputClass}
                  />
                </div>
              </th>
              <th className="px-4 py-2 font-normal normal-case">
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value as RequestStatus | "")}
                  className={filterInputClass}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-2 text-right font-normal normal-case">
                {hasActiveFilters(filters) && (
                  <button
                    onClick={() => setFilters(emptyFilters)}
                    className="text-xs text-on-surface-variant underline-offset-2 hover:text-primary hover:underline"
                  >
                    Temizle
                  </button>
                )}
              </th>
            </tr>
          )}
        </thead>
        <tbody className="divide-y divide-white/5 text-table-data font-table-data">
          {filteredRequests.length === 0 ? (
            <tr>
              <td
                colSpan={showAgencyColumn ? 8 : 7}
                className="px-4 py-12 text-center text-on-surface-variant"
              >
                Filtreye uygun kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            filteredRequests.map((request, index) => (
              <tr
                key={request.id}
                className={`group transition-all hover:border-l hover:border-mint-glow hover:bg-surface-variant/30 ${
                  index % 2 === 1 ? "bg-white/[0.02]" : ""
                }`}
              >
                <td className="px-4 py-3 font-mono text-primary/80">#{request.id}</td>
                {showAgencyColumn && (
                  <td className="px-4 py-3 text-on-surface">{request.agencyName}</td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
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
                <td className="px-4 py-3 text-on-surface">{request.adults + request.children}</td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {dateFormatter.format(new Date(request.startDate))}
                </td>
                <td className="px-4 py-3 font-medium text-on-surface">
                  {formatMoney(request.amount, request.currency)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                  {interactive &&
                    omConfigured &&
                    request.status === "onaylandi" &&
                    (request.omSyncStatus === "pending" || request.omSyncStatus === "failed") && (
                      <div className="mt-1.5 flex flex-col items-start gap-1">
                        <span className="text-[11px] text-warning">
                          {request.omSyncStatus === "failed"
                            ? "Operasyon sistemine gönderilemedi"
                            : "Operasyon sistemine henüz gönderilmedi"}
                        </span>
                        <OmSyncRetryButton requestId={request.id} />
                      </div>
                    )}
                </td>
                <td className="px-4 py-3 text-right">
                  {interactive ? (
                    <RequestActionsMenu requestId={request.id} agencyName={request.agencyName} />
                  ) : (
                    <button className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary">
                      <Icon name="more_vert" className="text-[20px]" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
