import type { Currency } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

export interface DatePriceRow {
  travelPeriod: string;
  priceCategory: string;
  airline: string;
  price: string;
  currency: Currency;
}

export type PricingFormState = DatePriceRow[];

export const emptyPricingForm: PricingFormState = [];

const PRICE_CATEGORIES = ["Bütçe", "Standart", "Üst"];
const CURRENCIES: Currency[] = ["TRY", "USD", "EUR", "GBP"];

const cellInputClass =
  "w-full border-0 bg-transparent p-0 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0";

interface PricingTabProps {
  value: PricingFormState;
  onChange: (value: PricingFormState) => void;
}

export function PricingTab({ value, onChange }: PricingTabProps) {
  function addRow() {
    onChange([
      ...value,
      { travelPeriod: "", priceCategory: "Standart", airline: "", price: "", currency: "TRY" },
    ]);
  }

  function updateRow(index: number, patch: Partial<DatePriceRow>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
          Tarihler ve Fiyatlar
        </h3>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 rounded-lg bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/20"
        >
          <Icon name="add" className="text-[18px]" />
          Yeni Dönem Ekle
        </button>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Henüz eklenmedi.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-outline-variant">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Seyahat Dönemi</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Kategori</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Havayolu</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Fiyat</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Para Birimi</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {value.map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    <input
                      value={row.travelPeriod}
                      onChange={(e) => updateRow(index, { travelPeriod: e.target.value })}
                      placeholder="Örn: 1-23 Mart"
                      className={cellInputClass}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.priceCategory}
                      onChange={(e) => updateRow(index, { priceCategory: e.target.value })}
                      className={cellInputClass}
                    >
                      {PRICE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={row.airline}
                      onChange={(e) => updateRow(index, { airline: e.target.value })}
                      placeholder="Örn: Etihad Havayolları"
                      className={cellInputClass}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => updateRow(index, { price: e.target.value })}
                      placeholder="0"
                      className={cellInputClass}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.currency}
                      onChange={(e) => updateRow(index, { currency: e.target.value as Currency })}
                      className={cellInputClass}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-error hover:text-error/80"
                      aria-label="Satırı sil"
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
