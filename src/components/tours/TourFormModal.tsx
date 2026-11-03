"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { createTourAction, updateTourAction } from "@/lib/data/tour-actions";
import { validateTourGeneralInput, generateSlug, parsePriceInput, type TourGeneralFieldErrors } from "@/lib/validation/tour";
import type { CreateTourInput, Currency, TourEditData, UpdateTourInput } from "@/lib/types";
import { GeneralTab, emptyGeneralForm, type GeneralFormState } from "./GeneralTab";
import { ImagesTab, emptyImagesForm, type ImagesFormState } from "./ImagesTab";
import { HighlightsTab, emptyHighlightsForm, type HighlightsFormState } from "./HighlightsTab";
import { ProgramTab, emptyProgramForm, type ProgramFormState } from "./ProgramTab";
import { PricingTab, emptyPricingForm, type PricingFormState } from "./PricingTab";
import { WeatherTab, emptyWeatherForm, type WeatherFormState } from "./WeatherTab";
import {
  GroupPricingTab,
  emptyGroupPricingForm,
  findInvalidPriceCell,
  toGroupPricingFormState,
  type GroupPricingFormState,
} from "./GroupPricingTab";

const TABS = [
  { id: "general", label: "Genel Bilgiler", icon: "info" },
  { id: "images", label: "Görseller", icon: "image" },
  { id: "highlights", label: "Öne Çıkanlar", icon: "star" },
  { id: "program", label: "Program", icon: "calendar_month" },
  { id: "pricing", label: "Fiyatlandırma", icon: "payments" },
  { id: "groupPricing", label: "Grup Fiyatları", icon: "groups" },
  { id: "weather", label: "Hava Durumu", icon: "wb_sunny" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface FormState {
  general: GeneralFormState;
  images: ImagesFormState;
  highlights: HighlightsFormState;
  program: ProgramFormState;
  pricing: PricingFormState;
  groupPricing: GroupPricingFormState;
  weather: WeatherFormState;
}

const emptyFormState: FormState = {
  general: emptyGeneralForm,
  images: emptyImagesForm,
  highlights: emptyHighlightsForm,
  program: emptyProgramForm,
  pricing: emptyPricingForm,
  groupPricing: emptyGroupPricingForm,
  weather: emptyWeatherForm,
};

/** Builds the form's initial state from an existing tour's full edit data
 * (`getTourForEdit`), or returns the blank create-mode state when there's
 * none. Weather rows are merged onto the full 12-month template so every
 * month tab always renders, matching the create form's shape. */
function toFormState(data?: TourEditData): FormState {
  if (!data) return emptyFormState;
  return {
    general: {
      title: data.title,
      titleEn: data.titleEn,
      slug: data.slug,
      slugTouched: true,
      region: data.region,
      duration: data.duration,
      durationEn: data.durationEn,
      basePrice: String(data.basePrice),
      basePriceCurrency: data.basePriceCurrency,
      baseDateStart: data.baseDateStart,
      baseDateEnd: data.baseDateEnd,
      shortDescription: data.shortDescription,
      shortDescriptionEn: data.shortDescriptionEn,
      longDescription: data.longDescription,
      longDescriptionEn: data.longDescriptionEn,
      popularTour: data.popularTour,
      destinationStatus: data.destinationStatus,
      opportunityTour: data.opportunityTour,
    },
    images: {
      hero: { path: data.heroImagePath, url: data.heroImageUrl },
      map: { path: data.toursMapImage, url: data.toursMapImageUrl },
      image1: { path: data.toursImage1, url: data.toursImage1Url },
      image2: { path: data.toursImage2, url: data.toursImage2Url },
      image3: { path: data.toursImage3, url: data.toursImage3Url },
    },
    highlights: {
      highlights: data.highlights,
      inclusions: data.inclusions,
      tips: data.tips,
    },
    program: data.dailyPrograms,
    pricing: data.datesPrices.map((p) => ({ ...p, price: String(p.price) })),
    groupPricing: toGroupPricingFormState(data.groupPrices),
    weather: emptyWeatherForm.map((row) => {
      const match = data.weatherData.find((w) => w.month === row.month);
      return match
        ? { month: row.month, temperature: String(match.temperature), rainfall: String(match.rainfall), isBestPeriod: match.isBestPeriod }
        : row;
    }),
  };
}

function toTourInput(form: FormState) {
  return {
    title: form.general.title.trim(),
    titleEn: form.general.titleEn.trim(),
    region: form.general.region.trim(),
    duration: form.general.duration.trim(),
    durationEn: form.general.durationEn.trim(),
    basePrice: Number(form.general.basePrice),
    basePriceCurrency: form.general.basePriceCurrency,
    baseDateStart: form.general.baseDateStart || undefined,
    baseDateEnd: form.general.baseDateEnd || undefined,
    shortDescription: form.general.shortDescription.trim(),
    shortDescriptionEn: form.general.shortDescriptionEn.trim(),
    longDescription: form.general.longDescription.trim(),
    longDescriptionEn: form.general.longDescriptionEn.trim(),
    popularTour: form.general.popularTour,
    destinationStatus: form.general.destinationStatus,
    opportunityTour: form.general.opportunityTour,
    heroImagePath: form.images.hero.path || undefined,
    toursMapImage: form.images.map.path || undefined,
    toursImage1: form.images.image1.path || undefined,
    toursImage2: form.images.image2.path || undefined,
    toursImage3: form.images.image3.path || undefined,
    highlights: form.highlights.highlights.map((h, i) => ({
      content: h.content.trim(),
      contentEn: h.contentEn.trim() || undefined,
      displayOrder: i + 1,
    })),
    inclusions: form.highlights.inclusions.map((h, i) => ({
      content: h.content.trim(),
      contentEn: h.contentEn.trim() || undefined,
      displayOrder: i + 1,
    })),
    tips: form.highlights.tips.map((t) => ({
      content: t.content.trim(),
      contentEn: t.contentEn.trim() || undefined,
      iconName: t.iconName.trim() || "map-pin",
    })),
    dailyPrograms: form.program.map((p) => ({
      dayRange: p.dayRange.trim(),
      title: p.title.trim(),
      titleEn: p.titleEn.trim() || undefined,
      description: p.description.trim(),
      descriptionEn: p.descriptionEn.trim() || undefined,
    })),
    datesPrices: form.pricing
      .filter((p) => p.travelPeriod.trim() && p.price.trim())
      .map((p, i) => ({
        travelPeriod: p.travelPeriod.trim(),
        priceCategory: p.priceCategory,
        airline: p.airline.trim(),
        price: Number(p.price),
        currency: p.currency,
        displayOrder: i + 1,
      })),
    weatherData: form.weather
      .filter((w) => w.temperature.trim() || w.rainfall.trim())
      .map((w) => ({
        month: w.month,
        temperature: Number(w.temperature || 0),
        rainfall: Number(w.rainfall || 0),
        isBestPeriod: w.isBestPeriod,
      })),
    groupPrices: toGroupPriceCells(form.groupPricing),
  };
}

/** Flattens the grid into saved cells — boş hücreler kaydedilmez. `minPax`
 * comes straight from the column (fixed template, or parsed once when a
 * legacy extra column was loaded — see `deriveGroupPriceOrder`), not
 * re-parsed from the label here. `sortOrder` encodes `rowIndex * 100 +
 * colIndex` so re-opening the form reconstructs the same row/column order
 * (see `toGroupPricingFormState`). */
function toGroupPriceCells(form: GroupPricingFormState) {
  const result: { rowLabel: string; groupLabel: string; minPax: number; price: number; currency: Currency; sortOrder: number }[] = [];
  form.rowLabels.forEach((rowLabel, rowIndex) => {
    form.columns.forEach((col, colIndex) => {
      const cell = form.cells[rowIndex]?.[colIndex];
      if (!cell || !cell.price.trim()) return;
      result.push({
        rowLabel,
        groupLabel: col.label,
        minPax: col.minPax,
        price: parsePriceInput(cell.price),
        currency: cell.currency,
        sortOrder: rowIndex * 100 + colIndex,
      });
    });
  });
  return result;
}

function toCreateTourInput(form: FormState): CreateTourInput {
  return { ...toTourInput(form), slug: form.general.slug.trim() };
}

function toUpdateTourInput(form: FormState): UpdateTourInput {
  return toTourInput(form);
}

type TourFormProps =
  | { mode: "create"; renderTrigger: (open: () => void) => ReactNode }
  | { mode: "edit"; tourId: string; initialData: TourEditData; renderTrigger: (open: () => void) => ReactNode };

function TourForm(props: TourFormProps) {
  const initialData = props.mode === "edit" ? props.initialData : undefined;
  const [open, setOpen] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [form, setForm] = useState<FormState>(() => toFormState(initialData));
  const [fieldErrors, setFieldErrors] = useState<TourGeneralFieldErrors>({});
  const [heroImageError, setHeroImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const baselineForm = toFormState(initialData);
  const isDirty = JSON.stringify(form) !== JSON.stringify(baselineForm);

  function openForm() {
    setForm(toFormState(initialData));
    setFieldErrors({});
    setHeroImageError(null);
    setFormError(null);
    setActiveTab("general");
    setOpen(true);
  }

  function requestClose() {
    if (isDirty) {
      setConfirmingClose(true);
    } else {
      setOpen(false);
    }
  }

  function discardAndClose() {
    setConfirmingClose(false);
    setOpen(false);
  }

  function setGeneral(next: GeneralFormState) {
    // Auto-generate the slug from the title until the admin edits it by hand.
    // In edit mode the slug field is read-only, so `slugTouched` (forced
    // true when the form was built) keeps this from ever recomputing it.
    const slug = next.slugTouched ? next.slug : generateSlug(next.title);
    setForm((prev) => ({ ...prev, general: { ...next, slug } }));
  }

  function submit() {
    const validation = validateTourGeneralInput({
      title: form.general.title,
      slug: form.general.slug,
      region: form.general.region,
      duration: form.general.duration,
      basePrice: form.general.basePrice,
      shortDescription: form.general.shortDescription,
      longDescription: form.general.longDescription,
      baseDateStart: form.general.baseDateStart,
      baseDateEnd: form.general.baseDateEnd,
    });
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      setActiveTab("general");
      setFormError("Lütfen Genel Bilgiler sekmesindeki zorunlu alanları doldurun.");
      return;
    }
    setFieldErrors({});

    if (!form.images.hero.path) {
      setHeroImageError("Hero görseli zorunludur.");
      setActiveTab("images");
      setFormError("Lütfen 'Görseller' sekmesinden bir Hero Görseli yükleyin — bu alan olmadan tur kaydedilemez.");
      return;
    }
    setHeroImageError(null);

    const invalidPriceCell = findInvalidPriceCell(form.groupPricing);
    if (invalidPriceCell) {
      setActiveTab("groupPricing");
      setFormError(`"${invalidPriceCell.rowLabel}" / "${invalidPriceCell.groupLabel}" için 0'dan büyük geçerli bir sayı girin.`);
      return;
    }
    setFormError(null);

    startTransition(async () => {
      const result =
        props.mode === "edit"
          ? await updateTourAction(props.tourId, toUpdateTourInput(form))
          : await createTourAction(toCreateTourInput(form));
      if (result.error) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setConfirmingClose(false);
      setOpen(false);
      setSuccessMessage(
        props.mode === "edit"
          ? `"${form.general.title}" turu güncellendi.`
          : `"${form.general.title}" turu başarıyla oluşturuldu.`,
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    });
  }

  return (
    <>
      {props.renderTrigger(openForm)}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {props.mode === "edit" ? "Turu Düzenle" : "Yeni Tur Ekle"}
              </h2>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Kapat"
                className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto border-b border-outline-variant/50 px-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-secondary text-secondary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Icon name={tab.icon} className="text-[18px]" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "general" && (
                <GeneralTab
                  value={form.general}
                  onChange={setGeneral}
                  fieldErrors={fieldErrors}
                  slugEditable={props.mode !== "edit"}
                />
              )}
              {activeTab === "images" && (
                <ImagesTab
                  value={form.images}
                  heroError={heroImageError}
                  onChange={(images) => {
                    if (images.hero.path) setHeroImageError(null);
                    setForm((prev) => ({ ...prev, images }));
                  }}
                />
              )}
              {activeTab === "highlights" && (
                <HighlightsTab
                  value={form.highlights}
                  onChange={(highlights) => setForm((prev) => ({ ...prev, highlights }))}
                />
              )}
              {activeTab === "program" && (
                <ProgramTab
                  value={form.program}
                  onChange={(program) => setForm((prev) => ({ ...prev, program }))}
                />
              )}
              {activeTab === "pricing" && (
                <PricingTab
                  value={form.pricing}
                  onChange={(pricing) => setForm((prev) => ({ ...prev, pricing }))}
                />
              )}
              {activeTab === "groupPricing" && (
                <GroupPricingTab
                  value={form.groupPricing}
                  onChange={(groupPricing) => setForm((prev) => ({ ...prev, groupPricing }))}
                />
              )}
              {activeTab === "weather" && (
                <WeatherTab
                  value={form.weather}
                  onChange={(weather) => setForm((prev) => ({ ...prev, weather }))}
                />
              )}

              {formError && (
                <p className="mt-6 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                  {formError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-outline-variant/50 p-6">
              <button
                type="button"
                onClick={requestClose}
                className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmingClose && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl">
            <h3 className="mb-2 text-headline-sm font-headline-sm font-bold text-on-surface">
              Kaydedilmemiş değişiklikler var
            </h3>
            <p className="mb-6 text-sm text-on-surface-variant">Çıkmak istediğinize emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={discardAndClose}
                className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary shadow-lg">
          {successMessage}
        </div>
      )}
    </>
  );
}

export function NewTourForm() {
  return (
    <TourForm
      mode="create"
      renderTrigger={(open) => (
        <Button variant="primary" icon="add" onClick={open}>
          Yeni Tur Ekle
        </Button>
      )}
    />
  );
}

interface TourEditButtonProps {
  tourId: string;
  initialData: TourEditData;
}

export function TourEditButton({ tourId, initialData }: TourEditButtonProps) {
  return (
    <TourForm
      mode="edit"
      tourId={tourId}
      initialData={initialData}
      renderTrigger={(open) => (
        <Button variant="secondary" icon="edit" onClick={open}>
          Turu Düzenle
        </Button>
      )}
    />
  );
}
