import { siteConfig } from "./config";

const currencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

/** Formats a price like "₡1.250". Returns "—" for missing values. */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  dateStyle: "long",
  timeStyle: "short",
});

/** Formats a gram amount as "500g" or "1.5kg". */
export function formatGrams(g: number): string {
  return g >= 1000 ? `${g / 1000}kg` : `${g}g`;
}

/** Rounds grams to the nearest 10, minimum 100. */
export function roundGrams(g: number): number {
  return Math.max(100, Math.round(g / 10) * 10);
}

/** Formats an ISO timestamp for the "last updated" label. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}
