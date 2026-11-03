/**
 * Pure, isomorphic bounds + validation for a teklif talebi's planned start
 * date — no server-only imports, safe to bundle into a client component.
 * Both `RequestForm` (client, sets the date input's `min`/`max`) and
 * `createRequestAction` (server, authoritative) read the same constants and
 * call the same validator, so the two can never drift apart.
 */

/** En erken seçilebilir gün: bugünden bu kadar gün sonrası. */
export const MIN_REQUEST_LEAD_DAYS = 7;
/** En geç seçilebilir gün: bugünden bu kadar ay sonrası. */
export const MAX_REQUEST_LEAD_MONTHS = 6;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** "Bugün"ün Europe/Istanbul takvim tarihini, saat bileşeni olmadan,
 * UTC-tabanlı bir `Date` olarak döner — sunucunun veya tarayıcının kendi
 * saat dilimi farklı olsa da gün sınırı hep İstanbul'a göre hesaplanır. */
function istanbulTodayAsUtcDate(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface RequestDateBounds {
  min: string; // YYYY-MM-DD
  max: string; // YYYY-MM-DD
}

/** `<input type="date" min max>` için — ve sunucu tarafı aralık
 * kontrolünün aynı iki sınırı. */
export function getRequestDateBounds(): RequestDateBounds {
  const today = istanbulTodayAsUtcDate();

  const min = new Date(today);
  min.setUTCDate(min.getUTCDate() + MIN_REQUEST_LEAD_DAYS);

  const max = new Date(today);
  max.setUTCMonth(max.getUTCMonth() + MAX_REQUEST_LEAD_MONTHS);

  return { min: toIsoDate(min), max: toIsoDate(max) };
}

export function requestDateRangeError(): string {
  return `Başlangıç tarihi en erken ${MIN_REQUEST_LEAD_DAYS} gün sonrası, en geç ${MAX_REQUEST_LEAD_MONTHS} ay sonrası olabilir.`;
}

export interface RequestDateValidationResult {
  valid: boolean;
  error: string | null;
}

/** Biçim (`YYYY-MM-DD`) ve aralık (bkz. `getRequestDateBounds`) kontrolü.
 * ISO tarih dizeleri bu sabit genişlikli biçimde doğrudan string
 * karşılaştırmasıyla kronolojik sırayla eşleşir, ayrıca `Date` ayrıştırmaya
 * gerek yok. */
export function validateRequestStartDate(startDate: string): RequestDateValidationResult {
  if (!DATE_PATTERN.test(startDate)) {
    return { valid: false, error: requestDateRangeError() };
  }
  const { min, max } = getRequestDateBounds();
  if (startDate < min || startDate > max) {
    return { valid: false, error: requestDateRangeError() };
  }
  return { valid: true, error: null };
}
