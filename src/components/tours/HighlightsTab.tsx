import { Icon } from "@/components/ui/Icon";
import { TextAreaField } from "./formFields";

export interface HighlightRow {
  content: string;
  contentEn: string;
}

export interface InclusionRow {
  content: string;
  contentEn: string;
}

/**
 * `tour_tips` has no icon concept on the live site — it always renders
 * these rows under "Dahil Olmayanlar" with a fixed red-X icon (confirmed
 * against inciyeni3's `TourDetailClient.tsx`), ignoring `icon_name`
 * entirely. `iconName` stays on the type (and keeps round-tripping through
 * edits unchanged) only because the column itself is NOT NULL; it's never
 * shown in this form.
 */
export interface TipRow {
  content: string;
  contentEn: string;
  iconName: string;
}

export interface HighlightsFormState {
  highlights: HighlightRow[];
  inclusions: InclusionRow[];
  tips: TipRow[];
}

export const emptyHighlightsForm: HighlightsFormState = {
  highlights: [],
  inclusions: [],
  tips: [],
};

const DEFAULT_TIP_ICON = "close";

interface HighlightsTabProps {
  value: HighlightsFormState;
  onChange: (value: HighlightsFormState) => void;
}

/**
 * Three content lists, each backed by its own child table and each
 * rendered by the live site under a fixed heading — confirmed against
 * inciyeni3's `TourDetailClient.tsx`, not assumed from this table's own
 * naming:
 *   - `tour_highlights` → "Öne Çıkanlar" (amber star)
 *   - `tour_inclusions` → "Dahil Olanlar" (green check)
 *   - `tour_tips`       → "Dahil Olmayanlar" (red X)
 * All three use the identical add/edit/remove format; `tour_tips` rows
 * still carry a hidden `iconName` (see `TipRow`) so a save never violates
 * that column's NOT NULL constraint.
 */
export function HighlightsTab({ value, onChange }: HighlightsTabProps) {
  return (
    <div className="space-y-10">
      <ContentListSection
        title="Öne Çıkanlar"
        addLabel="Madde Ekle"
        rows={value.highlights}
        onChange={(rows) => onChange({ ...value, highlights: rows })}
        newRow={() => ({ content: "", contentEn: "" })}
      />
      <ContentListSection
        title="Dahil Olanlar"
        addLabel="Madde Ekle"
        rows={value.inclusions}
        onChange={(rows) => onChange({ ...value, inclusions: rows })}
        newRow={() => ({ content: "", contentEn: "" })}
      />
      <ContentListSection
        title="Dahil Olmayanlar"
        addLabel="Madde Ekle"
        rows={value.tips}
        onChange={(rows) => onChange({ ...value, tips: rows })}
        newRow={() => ({ content: "", contentEn: "", iconName: DEFAULT_TIP_ICON })}
      />
    </div>
  );
}

interface ContentListSectionProps<T extends { content: string; contentEn: string }> {
  title: string;
  addLabel: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  newRow: () => T;
}

function ContentListSection<T extends { content: string; contentEn: string }>({
  title,
  addLabel,
  rows,
  onChange,
  newRow,
}: ContentListSectionProps<T>) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...rows, newRow()])}
          className="flex items-center gap-1.5 rounded-lg bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/20"
        >
          <Icon name="add" className="text-[18px]" />
          {addLabel}
        </button>
      </div>
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="flex items-start gap-3 rounded-lg bg-surface-container p-4">
            <span className="mt-2.5 text-xs font-medium text-on-surface-variant">#{index + 1}</span>
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <TextAreaField
                label="İçerik"
                value={row.content}
                onChange={(v) => {
                  const next = [...rows];
                  next[index] = { ...next[index], content: v };
                  onChange(next);
                }}
                rows={2}
              />
              <TextAreaField
                label="İçerik (İngilizce)"
                hint="opsiyonel"
                value={row.contentEn}
                onChange={(v) => {
                  const next = [...rows];
                  next[index] = { ...next[index], contentEn: v };
                  onChange(next);
                }}
                rows={2}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="mt-2 text-error hover:text-error/80"
              aria-label="Satırı sil"
            >
              <Icon name="delete" className="text-[18px]" />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-on-surface-variant">Henüz eklenmedi.</p>
        )}
      </div>
    </div>
  );
}
