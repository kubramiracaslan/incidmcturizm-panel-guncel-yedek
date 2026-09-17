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
};

export function formatMoney(amount: number, currency: Currency): string {
  return (formatters[currency] ?? formatters.TRY).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
