import type { Locale } from "./i18n/config";

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

// "il y a 2 minutes" / "2 minutes ago" — built on Intl.RelativeTimeFormat
// rather than a hand-rolled string table so pluralization/grammar stays
// correct in both locales without maintaining that by hand.
export function formatRelativeTime(dateString: string, lang: Locale): string {
  const diffSeconds = Math.round((Date.now() - new Date(dateString).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });

  if (diffSeconds < 60) return rtf.format(0, "minute");

  for (const [unit, secondsInUnit] of UNITS) {
    if (diffSeconds >= secondsInUnit) {
      return rtf.format(-Math.floor(diffSeconds / secondsInUnit), unit);
    }
  }

  return rtf.format(0, "minute");
}
