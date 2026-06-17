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

/** Formats an ISO timestamp for the "last updated" label. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}
