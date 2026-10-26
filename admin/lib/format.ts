// Shared formatting helpers — previously redeclared page by page (11 copies
// of formatXAF, 29 of formatDate), which meant a currency or date-format
// change had to be hunted down across dozens of files. This is the one
// place to fix now. See the frontend's lib/pricing.ts for the equivalent on
// the customer-facing app.

// Generic currency formatter — purchase orders/invoices/expenses carry
// their own currency field (not always FCFA), so these pages need the
// explicit second argument rather than formatXAF's hardcoded one.
export function formatAmount(value: string | number, currency: string): string {
  return `${Number(value).toLocaleString("fr-FR")} ${currency}`;
}

export function formatXAF(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return formatAmount(value, "FCFA");
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };

/**
 * `toLocaleString` with just `dateStyle` (no `timeStyle`) formats the date
 * portion only, same output as `toLocaleDateString` — so this one function
 * covers both the date+time and date-only call sites that used to exist
 * separately, just by varying `options`.
 */
export function formatDate(iso: string | null | undefined, options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", options);
}
