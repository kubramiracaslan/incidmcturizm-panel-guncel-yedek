import type { Currency } from "@/lib/types";
import type { TourGeneralFieldErrors } from "@/lib/validation/tour";
import { CheckboxField, SelectField, TextAreaField, TextInput } from "./formFields";

export interface GeneralFormState {
  title: string;
  titleEn: string;
  slug: string;
  slugTouched: boolean;
  region: string;
  duration: string;
  durationEn: string;
  basePrice: string;
  basePriceCurrency: Currency;
  baseDateStart: string;
  baseDateEnd: string;
  shortDescription: string;
  shortDescriptionEn: string;
  longDescription: string;
  longDescriptionEn: string;
  popularTour: boolean;
  destinationStatus: boolean;
  opportunityTour: boolean;
}

export const emptyGeneralForm: GeneralFormState = {
  title: "",
  titleEn: "",
  slug: "",
  slugTouched: false,
  region: "",
  duration: "",
  durationEn: "",
  basePrice: "",
  basePriceCurrency: "TRY",
  baseDateStart: "",
  baseDateEnd: "",
  shortDescription: "",
  shortDescriptionEn: "",
  longDescription: "",
  longDescriptionEn: "",
  popularTour: false,
  destinationStatus: false,
  opportunityTour: false,
};

const CURRENCY_OPTIONS = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "GBP", label: "£ GBP" },
];

interface GeneralTabProps {
  value: GeneralFormState;
  onChange: (value: GeneralFormState) => void;
  fieldErrors: TourGeneralFieldErrors;
  /** false while editing an existing tour — the live site links to the
   * current slug, so it can't be changed once a tour exists. */
  slugEditable?: boolean;
  /** Mevcut turlardaki `region` değerleri — "Bölge" alanında yazım farkını
   * önlemek için bir `<datalist>` önerisi olarak gösterilir. Alan yine
   * serbest metin kalır, bu listeyle sınırlanmaz. */
  existingRegions?: string[];
}

export function GeneralTab({ value, onChange, fieldErrors, slugEditable = true, existingRegions = [] }: GeneralTabProps) {
  function set<K extends keyof GeneralFormState>(key: K, v: GeneralFormState[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          label="Tur Başlığı"
          value={value.title}
          error={fieldErrors.title}
          onChange={(v) => set("title", v)}
        />
        <TextInput
          label="Tur Başlığı (İngilizce)"
          hint="opsiyonel"
          value={value.titleEn}
          onChange={(v) => set("titleEn", v)}
        />
        {slugEditable ? (
          <TextInput
            label="URL Slug"
            hint="benzersiz olmalı"
            value={value.slug}
            error={fieldErrors.slug}
            onChange={(v) => onChange({ ...value, slug: v, slugTouched: true })}
          />
        ) : (
          <TextInput label="URL Slug" hint="düzenlemede değiştirilemez" value={value.slug} onChange={() => {}} disabled />
        )}
        <TextInput
          label="Bölge"
          hint='örn. "AFRİKA" veya "SİNEMATİK ROTALAR"'
          value={value.region}
          error={fieldErrors.region}
          onChange={(v) => set("region", v)}
          list="region-suggestions"
        />
        <datalist id="region-suggestions">
          {existingRegions.map((region) => (
            <option key={region} value={region} />
          ))}
        </datalist>
        <TextInput
          label="Süre"
          placeholder="Örn: 5 GECE 7 GÜN"
          value={value.duration}
          error={fieldErrors.duration}
          onChange={(v) => set("duration", v)}
        />
        <TextInput
          label="Süre (İngilizce)"
          hint="opsiyonel"
          value={value.durationEn}
          onChange={(v) => set("durationEn", v)}
        />
        <TextInput
          label="Başlangıç Fiyatı"
          type="number"
          value={value.basePrice}
          error={fieldErrors.basePrice}
          onChange={(v) => set("basePrice", v)}
        />
        <SelectField
          label="Para Birimi"
          value={value.basePriceCurrency}
          onChange={(v) => set("basePriceCurrency", v as Currency)}
          options={CURRENCY_OPTIONS}
        />
        <TextInput
          label="Başlangıç Tarihi"
          hint="opsiyonel"
          type="date"
          max="9999-12-31"
          error={fieldErrors.baseDateStart}
          value={value.baseDateStart}
          onChange={(v) => set("baseDateStart", v)}
        />
        <TextInput
          label="Bitiş Tarihi"
          hint="opsiyonel"
          type="date"
          max="9999-12-31"
          error={fieldErrors.baseDateEnd}
          value={value.baseDateEnd}
          onChange={(v) => set("baseDateEnd", v)}
        />
      </div>

      <TextAreaField
        label="Kısa Açıklama"
        hint="tur listesinde görünecek"
        value={value.shortDescription}
        error={fieldErrors.shortDescription}
        onChange={(v) => set("shortDescription", v)}
        rows={2}
      />
      <TextAreaField
        label="Kısa Açıklama (İngilizce)"
        hint="opsiyonel"
        value={value.shortDescriptionEn}
        onChange={(v) => set("shortDescriptionEn", v)}
        rows={2}
      />
      <TextAreaField
        label="Detaylı Açıklama"
        value={value.longDescription}
        error={fieldErrors.longDescription}
        onChange={(v) => set("longDescription", v)}
        rows={4}
      />
      <TextAreaField
        label="Detaylı Açıklama (İngilizce)"
        hint="opsiyonel"
        value={value.longDescriptionEn}
        onChange={(v) => set("longDescriptionEn", v)}
        rows={4}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CheckboxField
          label="Popüler Tur"
          checked={value.popularTour}
          onChange={(v) => set("popularTour", v)}
        />
        <CheckboxField
          label="Destinasyon"
          checked={value.destinationStatus}
          onChange={(v) => set("destinationStatus", v)}
        />
        <CheckboxField
          label="Fırsat Turu"
          checked={value.opportunityTour}
          onChange={(v) => set("opportunityTour", v)}
        />
      </div>
    </div>
  );
}
