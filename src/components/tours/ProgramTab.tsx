import { Icon } from "@/components/ui/Icon";
import { TextAreaField, TextInput } from "./formFields";

export interface DailyProgramRow {
  dayRange: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

export type ProgramFormState = DailyProgramRow[];

export const emptyProgramForm: ProgramFormState = [];

interface ProgramTabProps {
  value: ProgramFormState;
  onChange: (value: ProgramFormState) => void;
}

export function ProgramTab({ value, onChange }: ProgramTabProps) {
  function addDay() {
    onChange([
      ...value,
      { dayRange: String(value.length + 1), title: "", titleEn: "", description: "", descriptionEn: "" },
    ]);
  }

  function removeDay(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateDay(index: number, patch: Partial<DailyProgramRow>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
          Günlük Program
        </h3>
        <button
          type="button"
          onClick={addDay}
          className="flex items-center gap-1.5 rounded-lg bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/20"
        >
          <Icon name="add" className="text-[18px]" />
          Yeni Gün Ekle
        </button>
      </div>

      <div className="space-y-4">
        {value.map((day, index) => (
          <div key={index} className="space-y-3 rounded-lg bg-surface-container p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-on-surface">Gün {day.dayRange}</span>
              <button
                type="button"
                onClick={() => removeDay(index)}
                className="flex items-center gap-1 text-xs text-error hover:underline"
              >
                <Icon name="delete" className="text-[16px]" />
                Günü Sil
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[100px_1fr_1fr]">
              <TextInput
                label="Gün No"
                value={day.dayRange}
                onChange={(v) => updateDay(index, { dayRange: v })}
              />
              <TextInput
                label="Gün Başlığı"
                value={day.title}
                onChange={(v) => updateDay(index, { title: v })}
              />
              <TextInput
                label="Gün Başlığı (İngilizce)"
                hint="opsiyonel"
                value={day.titleEn}
                onChange={(v) => updateDay(index, { titleEn: v })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextAreaField
                label="Program Detayı"
                value={day.description}
                onChange={(v) => updateDay(index, { description: v })}
                rows={3}
              />
              <TextAreaField
                label="Program Detayı (İngilizce)"
                hint="opsiyonel"
                value={day.descriptionEn}
                onChange={(v) => updateDay(index, { descriptionEn: v })}
                rows={3}
              />
            </div>
          </div>
        ))}
        {value.length === 0 && <p className="text-sm text-on-surface-variant">Henüz eklenmedi.</p>}
      </div>
    </div>
  );
}
