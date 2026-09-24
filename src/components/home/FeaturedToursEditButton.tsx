"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { updateFeaturedSectionAction, setTourPopularAction } from "@/lib/data/home-actions";
import { validateFeaturedSectionInput, type FeaturedSectionInput } from "@/lib/validation/home";
import type { Tour } from "@/lib/types";

const MAX_POPULAR_TOURS = 6;

interface FeaturedToursEditButtonProps {
  featuredSection: FeaturedSectionInput;
  tours: Tour[];
}

export function FeaturedToursEditButton({ featuredSection, tours }: FeaturedToursEditButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [sectionValues, setSectionValues] = useState<FeaturedSectionInput>(featuredSection);
  const [popularIds, setPopularIds] = useState<Set<string>>(
    () => new Set(tours.filter((t) => t.isPopular).map((t) => t.id)),
  );
  const [pendingTourId, setPendingTourId] = useState<string | null>(null);
  const [tourError, setTourError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSectionPending, startSectionTransition] = useTransition();
  const [, startTourTransition] = useTransition();

  const isDirty =
    sectionValues.title !== featuredSection.title ||
    sectionValues.subtitle !== featuredSection.subtitle ||
    sectionValues.description !== featuredSection.description;

  function openDrawer() {
    setSectionValues(featuredSection);
    setPopularIds(new Set(tours.filter((t) => t.isPopular).map((t) => t.id)));
    setSectionError(null);
    setTourError(null);
    setSuccessMessage(null);
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

  function saveSection() {
    const value = validateFeaturedSectionInput(sectionValues);
    setSectionError(null);

    const formData = new FormData();
    formData.set("title", value.title);
    formData.set("subtitle", value.subtitle);
    formData.set("description", value.description);

    startSectionTransition(async () => {
      const result = await updateFeaturedSectionAction(formData);
      if (result.error) {
        setSectionError(result.error);
        return;
      }
      setConfirmingClose(false);
      setSuccessMessage("Bölüm ayarları kaydedildi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    });
  }

  function toggleTour(tour: Tour) {
    const nextIsPopular = !popularIds.has(tour.id);
    if (nextIsPopular && popularIds.size >= MAX_POPULAR_TOURS) {
      setTourError(`En fazla ${MAX_POPULAR_TOURS} tur öne çıkarılabilir.`);
      return;
    }
    setTourError(null);
    setPendingTourId(tour.id);

    // Optimistic update — reverted below if the server call fails.
    setPopularIds((prev) => {
      const next = new Set(prev);
      if (nextIsPopular) next.add(tour.id);
      else next.delete(tour.id);
      return next;
    });

    startTourTransition(async () => {
      const result = await setTourPopularAction(tour.id, nextIsPopular);
      setPendingTourId(null);
      if (result.error) {
        setTourError(result.error);
        setPopularIds((prev) => {
          const next = new Set(prev);
          if (nextIsPopular) next.delete(tour.id);
          else next.add(tour.id);
          return next;
        });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-primary-container transition-colors hover:bg-brand-dark"
      >
        Ayarları Düzenle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                Öne Çıkan Turlar Ayarları
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

            <div className="flex-1 overflow-y-auto p-6">
              <section className="mb-8">
                <h3 className="mb-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Bölüm Metni
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-on-surface-variant">Ana Başlık</label>
                    <input
                      type="text"
                      value={sectionValues.title}
                      onChange={(e) => setSectionValues((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-on-surface-variant">Alt Başlık</label>
                    <input
                      type="text"
                      value={sectionValues.subtitle}
                      onChange={(e) => setSectionValues((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-on-surface-variant">Açıklama</label>
                    <textarea
                      value={sectionValues.description}
                      onChange={(e) => setSectionValues((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                    Turlar
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {popularIds.size}/{MAX_POPULAR_TOURS} seçili
                  </span>
                </div>
                {tourError && <p className="mb-3 text-sm text-error">{tourError}</p>}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tours.map((tour) => {
                    const isPopular = popularIds.has(tour.id);
                    return (
                      <div
                        key={tour.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                          isPopular
                            ? "border-secondary/50 bg-secondary/5"
                            : "border-outline-variant/50 bg-surface-container"
                        }`}
                      >
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-deep">
                          <Image src={tour.coverImage} alt={tour.name} fill unoptimized className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-on-surface">{tour.name}</p>
                          <p className="truncate text-xs text-on-surface-variant">{tour.region}</p>
                        </div>
                        <button
                          type="button"
                          disabled={pendingTourId === tour.id}
                          onClick={() => toggleTour(tour)}
                          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                            isPopular
                              ? "bg-brand text-primary-container hover:bg-brand-dark"
                              : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {pendingTourId === tour.id ? (
                            "..."
                          ) : isPopular ? (
                            <>
                              <Icon name="check" className="text-[14px]" />
                              Popüler
                            </>
                          ) : (
                            <>
                              <Icon name="add" className="text-[14px]" />
                              Ekle
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {sectionError && <p className="mt-6 text-sm text-error">{sectionError}</p>}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={isSectionPending}
                  onClick={saveSection}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {isSectionPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </button>
              </div>
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
            <p className="mb-6 text-sm text-on-surface-variant">
              Bölüm metnindeki değişiklikler kaydedilmedi. Çıkmak istediğinize emin misiniz?
            </p>
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
                disabled={isSectionPending}
                onClick={saveSection}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {isSectionPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
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
