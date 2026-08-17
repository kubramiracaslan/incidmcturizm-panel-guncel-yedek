import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { TeklifTalebi } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { RequestActionsMenu } from "./RequestActionsMenu";

interface RequestsTableProps {
  requests: TeklifTalebi[];
  showAgencyColumn?: boolean;
  /** Admin can act on a request's status inline; agents can only view it. */
  interactive?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function RequestsTable({
  requests,
  showAgencyColumn = false,
  interactive = false,
}: RequestsTableProps) {
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
              Tutar
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
          {requests.map((request, index) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
