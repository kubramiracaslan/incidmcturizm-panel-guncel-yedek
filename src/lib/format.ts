import type { Currency, RequestStatus } from "@/lib/types";

export const requestStatusLabels: Record<RequestStatus, string> = {
  beklemede: "Beklemede",
  onaylandi: "Onaylandı",
  revize_istendi: "Revize İstendi",
  reddedildi: "Reddedildi",
};

const formatters: Record<Currency, Intl.NumberFormat> = {
  TRY: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
  EUR: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
  GBP: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }),
};

export function formatMoney(amount: number, currency: Currency): string {
  return (formatters[currency] ?? formatters.TRY).format(amount);
}

const TURKISH_FOLD: Record<string, string> = {
  İ: "i", I: "i", ı: "i", i: "i",
  Ş: "s", ş: "s",
  Ğ: "g", ğ: "g",
  Ü: "u", ü: "u",
  Ö: "o", ö: "o",
  Ç: "c", ç: "c",
};

/** Case-insensitive search normalizer that also folds Turkish letters to a
 * single canonical ASCII-ish form — plain `toLowerCase()` alone gets the
 * classic Turkish-I problem wrong ("İSTANBUL".toLowerCase() → "i̇stanbul",
 * not "istanbul"), so typing plain ASCII wouldn't reliably match accented
 * Turkish text. Used for free-text tour search (title/region/short
 * description), not for display. */
export function normalizeForSearch(value: string): string {
  return value
    .split("")
    .map((ch) => TURKISH_FOLD[ch] ?? ch.toLowerCase())
    .join("");
}

export function formatDate(iso: string): string {
  // `timeZone` pinned explicitly: without it, `Intl.DateTimeFormat` falls
  // back to the server process's own timezone, which is Europe/Istanbul on
  // a local dev machine but typically UTC in production (e.g. Vercel) —
  // dates near midnight could otherwise render a day off depending on
  // where the app happens to be running.
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}
