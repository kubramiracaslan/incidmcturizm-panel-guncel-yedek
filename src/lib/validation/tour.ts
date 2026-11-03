/**
 * Pure, isomorphic validation + helpers for the "Yeni Tur Ekle" form's
 * general-info section — no server-only imports, safe to bundle into a
 * client component. Both the form (client, UX-only feedback) and the
 * create-tour Server Action (server, authoritative) call the same
 * function so the rules can never drift apart.
 */

import type { CreateTourGroupPriceInput } from "@/lib/types";

export interface TourGeneralInput {
  title: string;
  slug: string;
  region: string;
  duration: string;
  basePrice: string;
  shortDescription: string;
  longDescription: string;
  baseDateStart?: string;
  baseDateEnd?: string;
}

export type TourGeneralFieldErrors = Partial<Record<keyof TourGeneralInput, string>>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type TourGeneralValidationResult =
  | { valid: true; fieldErrors: TourGeneralFieldErrors }
  | { valid: false; fieldErrors: TourGeneralFieldErrors };

export function validateTourGeneralInput(input: TourGeneralInput): TourGeneralValidationResult {
  const fieldErrors: TourGeneralFieldErrors = {};

  if (!input.title.trim()) fieldErrors.title = "Tur başlığı boş bırakılamaz.";
  if (!input.slug.trim()) fieldErrors.slug = "URL slug boş bırakılamaz.";
  if (!input.region.trim()) fieldErrors.region = "Bölge boş bırakılamaz.";
  if (!input.duration.trim()) fieldErrors.duration = "Süre boş bırakılamaz.";

  const price = Number(input.basePrice);
  if (!input.basePrice.trim() || Number.isNaN(price) || price <= 0) {
    fieldErrors.basePrice = "Geçerli bir başlangıç fiyatı girin.";
  }

  if (!input.shortDescription.trim()) fieldErrors.shortDescription = "Kısa açıklama boş bırakılamaz.";
  if (!input.longDescription.trim()) fieldErrors.longDescription = "Detaylı açıklama boş bırakılamaz.";

  // `<input type="date" max="9999-12-31">` stops most browsers from typing a
  // 5+ digit year, but some don't enforce `max` while typing — re-check the
  // exact "YYYY-MM-DD" shape server-side so a malformed value never reaches
  // the database.
  if (input.baseDateStart && !DATE_PATTERN.test(input.baseDateStart)) {
    fieldErrors.baseDateStart = "Geçerli bir tarih girin (yıl en fazla 4 hane).";
  }
  if (input.baseDateEnd && !DATE_PATTERN.test(input.baseDateEnd)) {
    fieldErrors.baseDateEnd = "Geçerli bir tarih girin (yıl en fazla 4 hane).";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true, fieldErrors: {} };
}

/** Parses a price field that allows comma as the decimal separator —
 * "120,5" and "120.5" both parse to 120.5. Does not support a thousands
 * separator by design: "1.234,56" has two separators once the comma
 * becomes a dot, so it correctly fails to parse rather than being read as
 * 1234.56. Used wherever a raw "Grup Fiyatları" cell string becomes the
 * number that actually gets saved (`toGroupPriceCells` in
 * `TourFormModal.tsx`) and wherever that same string is validated before
 * saving (`findInvalidPriceCell`), so the two can never disagree. */
export function parsePriceInput(raw: string): number {
  return Number(raw.trim().replace(/,/g, "."));
}

/** Shared price rule: must be a real, positive number. Applied to the
 * already-numeric `price` on the server (`validateGroupPriceCells`) and,
 * client-side, to the result of `parsePriceInput` on a cell's raw string
 * (`findInvalidPriceCell`) — same rule, same function, on either side of
 * the parse. */
export function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price > 0;
}

export interface GroupPriceValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Server-side guard for a "Grup Fiyatları" batch, run before
 * `updateTourAction`/`createTourAction` call the repository — specifically
 * before `updateTour` deletes the tour's existing `tour_group_prices` rows,
 * so a bad batch never costs the tour its previously-saved prices. Checks
 * the two things that must hold for the batch to be insertable: every price
 * is a real, positive number (`isValidPrice`), and no (rowLabel, groupLabel)
 * pair repeats (the table's `unique (tour_id, row_label, group_label)`
 * constraint would otherwise reject the whole insert with an opaque
 * database error).
 */
export function validateGroupPriceCells(cells: CreateTourGroupPriceInput[]): GroupPriceValidationResult {
  const seen = new Set<string>();
  for (const cell of cells) {
    if (!isValidPrice(cell.price)) {
      return {
        valid: false,
        error: `"${cell.rowLabel}" / "${cell.groupLabel}" için 0'dan büyük geçerli bir fiyat girilmedi.`,
      };
    }
    const key = `${cell.rowLabel}::${cell.groupLabel}`;
    if (seen.has(key)) {
      return {
        valid: false,
        error: `Satır/sütun kombinasyonu tekrarlanmış: "${cell.rowLabel}" / "${cell.groupLabel}" birden fazla kez girilmiş.`,
      };
    }
    seen.add(key);
  }
  return { valid: true, error: null };
}

/** Turkish-aware slugify — mirrors the old admin panel's own logic exactly. */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
