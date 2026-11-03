"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { createRequestAction, type CreateRequestFormState } from "@/lib/data/actions";
import { getRequestDateBounds } from "@/lib/validation/request";
import type { Tour } from "@/lib/types";

const initialState: CreateRequestFormState = { error: null };

function PassengerCounter({
  icon,
  label,
  sublabel,
  value,
  min,
  onChange,
}: {
  icon: string;
  label: string;
  sublabel: string;
  value: number;
  min: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-deep p-4 transition-all focus-within:border-mint-glow">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-variant text-on-surface">
          <Icon name={icon} className="text-sm" />
        </div>
        <div>
          <div className="text-body-md font-body-md text-on-surface">{label}</div>
          <div className="text-label-sm font-label-sm text-on-surface-variant">{sublabel}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-on-surface transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="remove" className="text-sm" />
        </button>
        <span className="w-4 text-center text-body-lg font-bold text-on-surface">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-on-surface transition-colors hover:bg-surface-variant"
        >
          <Icon name="add" className="text-sm" />
        </button>
      </div>
    </div>
  );
}

interface RequestFormProps {
  tour: Tour;
  /** Plain navigation cancel — ignored when `onCancel` is also passed. */
  cancelHref?: string;
  /** Used instead of `cancelHref` when the form is shown inside a modal
   * (closes the modal rather than navigating away). */
  onCancel?: () => void;
}

export function RequestForm({ tour, cancelHref, onCancel }: RequestFormProps) {
  // `onCancel` (modal usage) always wins and never renders a `<Link>`.
  // Otherwise fall back to `cancelHref`, defaulting to the tour catalog so
  // `<Link href>` is never undefined regardless of how this is called.
  const effectiveCancelHref = cancelHref ?? "/agent/tur-katalogu";
  const dateBounds = getRequestDateBounds();
  const boundAction = createRequestAction.bind(null, tour.id);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-primary-container p-8">
      <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-mint-glow opacity-5 blur-3xl" />

      <form action={formAction} className="relative z-10 space-y-6">
        <div>
          <label
            htmlFor="startDate"
            className="mb-2 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
          >
            Planlanan Başlangıç Tarihi
          </label>
          <div className="relative">
            <Icon
              name="calendar_month"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              min={dateBounds.min}
              max={dateBounds.max}
              className="w-full rounded-lg border border-outline-variant bg-surface-deep py-3 pl-10 pr-4 text-body-lg text-on-surface transition-all focus:border-mint-glow focus:outline-none focus:ring-1 focus:ring-mint-glow [color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
            Tur Süresi
          </span>
          <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-deep px-4 py-3 text-body-lg text-on-surface">
            <Icon name="schedule" className="text-on-surface-variant" />
            Tur süresi: {tour.nights} Gece / {tour.days} Gün
          </div>
        </div>

        <div>
          <span className="mb-2 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
            Yolcu Detayları
          </span>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PassengerCounter
              icon="person"
              label="Yetişkin"
              sublabel="+12 Yaş"
              value={adults}
              min={1}
              onChange={setAdults}
            />
            <PassengerCounter
              icon="child_care"
              label="Çocuk"
              sublabel="2-11 Yaş"
              value={children}
              min={0}
              onChange={setChildren}
            />
          </div>
          <input type="hidden" name="adults" value={adults} />
          <input type="hidden" name="children" value={children} />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
          >
            Özel İstekler &amp; Notlar
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Tur süresinde veya programda değişiklik talebiniz, oda tipi tercihi, özel yemek gereksinimi gibi notlarınızı buraya yazabilirsiniz."
            className="w-full resize-none rounded-lg border border-outline-variant bg-surface-deep p-4 text-body-md text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-mint-glow focus:outline-none focus:ring-1 focus:ring-mint-glow"
          />
          <p className="mt-2 text-label-sm font-label-sm text-on-surface-variant">
            Süre değişikliği taleplerinde size özel bir program hazırlanır.
          </p>
        </div>

        {state.error && (
          <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-sm text-error">
            {state.error}
          </p>
        )}

        <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-mint-glow/50 px-6 py-3 text-body-md font-semibold text-secondary transition-colors hover:bg-mint-glow/10"
            >
              İptal
            </button>
          ) : (
            <Link
              href={effectiveCancelHref}
              className="rounded-lg border border-mint-glow/50 px-6 py-3 text-body-md font-semibold text-secondary transition-colors hover:bg-mint-glow/10"
            >
              İptal
            </Link>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-brand px-8 py-3 text-body-lg font-bold text-primary-container shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] disabled:pointer-events-none disabled:opacity-50"
          >
            <Icon name="send" />
            {isPending ? "Gönderiliyor..." : "Teklif Talebi Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}
