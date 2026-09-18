export interface WeatherRow {
  month: string;
  temperature: string;
  rainfall: string;
  isBestPeriod: boolean;
}

export type WeatherFormState = WeatherRow[];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const emptyWeatherForm: WeatherFormState = MONTHS.map((month) => ({
  month,
  temperature: "",
  rainfall: "",
  isBestPeriod: false,
}));

interface WeatherTabProps {
  value: WeatherFormState;
  onChange: (value: WeatherFormState) => void;
}

export function WeatherTab({ value, onChange }: WeatherTabProps) {
  function update(index: number, patch: Partial<WeatherRow>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
        Aylık Hava Durumu
      </h3>
      <div className="overflow-hidden rounded-lg border border-outline-variant">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-4 py-3 font-medium text-on-surface-variant">Ay</th>
              <th className="px-4 py-3 font-medium text-on-surface-variant">Sıcaklık (°C)</th>
              <th className="px-4 py-3 font-medium text-on-surface-variant">Yağış (mm)</th>
              <th className="px-4 py-3 font-medium text-on-surface-variant">En İyi Dönem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {value.map((row, index) => (
              <tr key={row.month}>
                <td className="px-4 py-3 font-medium text-on-surface">{row.month}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={row.temperature}
                    onChange={(e) => update(index, { temperature: e.target.value })}
                    placeholder="0"
                    className="w-20 border-0 bg-transparent p-0 text-sm text-on-surface focus:outline-none focus:ring-0"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={row.rainfall}
                    onChange={(e) => update(index, { rainfall: e.target.value })}
                    placeholder="0"
                    className="w-20 border-0 bg-transparent p-0 text-sm text-on-surface focus:outline-none focus:ring-0"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={row.isBestPeriod}
                    onChange={(e) => update(index, { isBestPeriod: e.target.checked })}
                    className="h-4 w-4 rounded border-outline-variant accent-secondary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
