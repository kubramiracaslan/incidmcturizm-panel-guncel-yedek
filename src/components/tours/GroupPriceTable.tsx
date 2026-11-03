import type { TourGroupPriceRow } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { GROUP_PRICE_CORNER_LABEL, deriveGroupPriceOrder } from "./GroupPricingTab";

interface GroupPriceTableProps {
  rows: TourGroupPriceRow[];
}

/** Read-only "Grup Fiyatları" display for agent/admin tour detail pages.
 * `rows` must already come from `repository.getTourGroupPrices()`, whose
 * RLS policy limits results to admin/approved-and-price-visible-agency
 * sessions — callers never need to re-check that here. Renders nothing at
 * all when there's no price data, so an agent without any (or without
 * price-visibility) simply never sees this section. */
export function GroupPriceTable({ rows }: GroupPriceTableProps) {
  if (rows.length === 0) return null;

  const { rowLabels, columns } = deriveGroupPriceOrder(rows);

  function cellFor(rowLabel: string, groupLabel: string) {
    return rows.find((r) => r.rowLabel === rowLabel && r.groupLabel === groupLabel);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-primary-container">
      <div className="border-b border-white/5 px-6 py-4">
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Grup Fiyatları</h3>
      </div>
      <div className="overflow-x-auto p-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="min-w-[180px] px-4 py-2 font-medium text-on-surface-variant">{GROUP_PRICE_CORNER_LABEL}</th>
              {columns.map((col) => (
                <th key={col.label} className="min-w-[110px] px-4 py-2 font-medium text-on-surface-variant">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {rowLabels.map((rowLabel) => (
              <tr key={rowLabel}>
                <td className="px-4 py-2 font-medium text-on-surface">{rowLabel}</td>
                {columns.map((col) => {
                  const cell = cellFor(rowLabel, col.label);
                  return (
                    <td key={col.label} className="px-4 py-2 text-on-surface-variant">
                      {cell ? formatMoney(cell.price, cell.currency) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-on-surface-variant">Fiyatlar kişi başıdır.</p>
      </div>
    </div>
  );
}
