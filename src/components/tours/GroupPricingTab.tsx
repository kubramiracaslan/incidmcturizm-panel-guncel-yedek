import type { Currency } from "@/lib/types";
import { isValidPrice, parsePriceInput } from "@/lib/validation/tour";
import { currencySymbol } from "@/lib/format";

export interface GroupPriceCellValue {
  price: string;
}

export interface GroupPricingColumn {
  label: string;
  minPax: number;
}

/**
 * "Grup Fiyatları" grid state. Row and column headers are fixed —
 * `GROUP_PRICE_ROW_LABELS` / `GROUP_PRICE_COLUMNS` — admin only fills in
 * prices, never adds/renames/removes a row or column. The one exception:
 * an older tour saved before this template existed may have row/group
 * labels outside the standard set; those are appended (read from
 * `toGroupPricingFormState`) so that data stays visible and editable
 * instead of silently disappearing.
 *
 * `currency` is a single, table-wide choice — every cell is saved with this
 * same currency (see `toGroupPriceCells` in `TourFormModal.tsx`), there is
 * no per-cell currency anymore.
 */
export interface GroupPricingFormState {
  currency: Currency;
  rowLabels: string[];
  columns: GroupPricingColumn[];
  cells: GroupPriceCellValue[][]; // cells[rowIndex][colIndex]
}

/** Top-left corner label — not a row, just the header above the row-label
 * column. Change this and the two arrays below to retarget the whole
 * template in one place. */
export const GROUP_PRICE_CORNER_LABEL = "PAX";

export const GROUP_PRICE_ROW_LABELS = [
  "DBL PER PERSON",
  "SINGLE SUPPLEMENT",
  "3-11 AGE CHILDREN",
  "0-2 AGE CHILDREN",
] as const;

export const GROUP_PRICE_COLUMNS: GroupPricingColumn[] = [
  { label: "40+1", minPax: 40 },
  { label: "35+1", minPax: 35 },
  { label: "30+1", minPax: 30 },
  { label: "25+1", minPax: 25 },
  { label: "20+1", minPax: 20 },
  { label: "15+1", minPax: 15 },
  { label: "10+1", minPax: 10 },
];

const CURRENCIES: Currency[] = ["EUR", "USD", "TRY", "GBP"];

function emptyCell(): GroupPriceCellValue {
  return { price: "" };
}

export const emptyGroupPricingForm: GroupPricingFormState = {
  currency: "EUR",
  rowLabels: [...GROUP_PRICE_ROW_LABELS],
  columns: GROUP_PRICE_COLUMNS.map((c) => ({ ...c })),
  cells: GROUP_PRICE_ROW_LABELS.map(() => GROUP_PRICE_COLUMNS.map(() => emptyCell())),
};

function minPaxFromLabel(label: string): number {
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

/**
 * Rebuilds the grid from a flat list of saved cells: the fixed template
 * rows/columns always come first, in their fixed order; any row or group
 * label from the saved data that isn't part of the current template (e.g.
 * a tour saved under an older template) is appended afterwards, in the
 * order it's first seen, so that data is never silently dropped. Used both
 * to pre-fill the editable grid (`TourFormModal`) and, with its row/column
 * ordering alone, to render the read-only agent/admin table
 * (`GroupPriceTable`).
 */
export function deriveGroupPriceOrder(rows: { rowLabel: string; groupLabel: string }[]): {
  rowLabels: string[];
  columns: GroupPricingColumn[];
} {
  const extraRowLabels: string[] = [];
  const extraColumns: GroupPricingColumn[] = [];
  for (const row of rows) {
    if (!(GROUP_PRICE_ROW_LABELS as readonly string[]).includes(row.rowLabel) && !extraRowLabels.includes(row.rowLabel)) {
      extraRowLabels.push(row.rowLabel);
    }
    if (
      !GROUP_PRICE_COLUMNS.some((c) => c.label === row.groupLabel) &&
      !extraColumns.some((c) => c.label === row.groupLabel)
    ) {
      extraColumns.push({ label: row.groupLabel, minPax: minPaxFromLabel(row.groupLabel) });
    }
  }
  return {
    rowLabels: [...GROUP_PRICE_ROW_LABELS, ...extraRowLabels],
    columns: [...GROUP_PRICE_COLUMNS, ...extraColumns],
  };
}

/** Mevcut kayıtlarda satır başına farklı para birimi olsa bile (eski
 * veriler), tablo tek bir para birimine sahip gösterilir: ilk satırın
 * para birimi seçili gelir, admin kaydedince tüm satırlar o birime döner
 * (bkz. `toGroupPriceCells`, `TourFormModal.tsx`). */
export function toGroupPricingFormState(
  rows: { rowLabel: string; groupLabel: string; price: number; currency: Currency }[],
): GroupPricingFormState {
  if (rows.length === 0) return emptyGroupPricingForm;

  const { rowLabels, columns } = deriveGroupPriceOrder(rows);
  const cells: GroupPriceCellValue[][] = rowLabels.map((rowLabel) =>
    columns.map((col) => {
      const match = rows.find((r) => r.rowLabel === rowLabel && r.groupLabel === col.label);
      return match ? { price: String(match.price) } : emptyCell();
    }),
  );

  return { currency: rows[0].currency, rowLabels, columns, cells };
}

/** Returns the first cell whose price is non-empty but not a valid,
 * positive number once parsed (comma accepted as the decimal separator —
 * see `parsePriceInput`; empty cells are intentionally skipped, they're
 * never saved), or null if every filled-in cell is valid. */
export function findInvalidPriceCell(form: GroupPricingFormState): { rowLabel: string; groupLabel: string } | null {
  for (let r = 0; r < form.rowLabels.length; r++) {
    for (let c = 0; c < form.columns.length; c++) {
      const raw = form.cells[r]?.[c]?.price.trim();
      if (raw && !isValidPrice(parsePriceInput(raw))) {
        return { rowLabel: form.rowLabels[r], groupLabel: form.columns[c].label };
      }
    }
  }
  return null;
}

const cellInputClass =
  "w-full border-0 bg-transparent p-0 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0";

interface GroupPricingTabProps {
  value: GroupPricingFormState;
  onChange: (value: GroupPricingFormState) => void;
}

/** Editable "Grup Fiyatları" grid — headers are fixed (see module docs);
 * the admin only ever edits a cell's price. Currency is picked once for
 * the whole table (see `value.currency`), not per cell. */
export function GroupPricingTab({ value, onChange }: GroupPricingTabProps) {
  function updateCell(rowIndex: number, colIndex: number, patch: Partial<GroupPriceCellValue>) {
    const cells = value.cells.map((row, r) =>
      r !== rowIndex ? row : row.map((cell, c) => (c !== colIndex ? cell : { ...cell, ...patch })),
    );
    onChange({ ...value, cells });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Grup Fiyatları</h3>
        <p className="text-xs text-on-surface-variant">
          Bu tablo sadece admin ve onaylı (ve fiyat görmesine izin verilen) acentelere gösterilir. Sadece fiyat
          doldurun — boş bırakılan hücreler kaydedilmez.
        </p>
      </div>

      <div>
        <label
          htmlFor="groupPricingCurrency"
          className="mb-1 block text-xs font-medium text-on-surface-variant"
        >
          Para Birimi
        </label>
        <select
          id="groupPricingCurrency"
          value={value.currency}
          onChange={(e) => onChange({ ...value, currency: e.target.value as Currency })}
          className="w-28 rounded-md border border-outline-variant bg-surface-container px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-mint-glow"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container">
            <tr>
              <th className="min-w-[180px] px-4 py-3 font-medium text-on-surface-variant">{GROUP_PRICE_CORNER_LABEL}</th>
              {value.columns.map((col) => (
                <th key={col.label} className="min-w-[140px] px-4 py-3 font-medium text-on-surface-variant">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {value.rowLabels.map((rowLabel, rowIndex) => (
              <tr key={rowLabel}>
                <td className="px-4 py-3 font-medium text-on-surface">{rowLabel}</td>
                {value.columns.map((col, colIndex) => {
                  const cell = value.cells[rowIndex]?.[colIndex] ?? emptyCell();
                  return (
                    <td key={col.label} className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-on-surface-variant">{currencySymbol(value.currency)}</span>
                        <input
                          type="number"
                          value={cell.price}
                          onChange={(e) => updateCell(rowIndex, colIndex, { price: e.target.value })}
                          placeholder="0"
                          className={`${cellInputClass} w-20`}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-on-surface-variant">Fiyatlar kişi başıdır.</p>
    </div>
  );
}
