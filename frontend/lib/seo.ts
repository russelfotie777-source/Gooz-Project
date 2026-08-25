import { locales, type Locale } from "./i18n/config";

// path has no leading slash and no locale prefix, e.g. "" (home),
// "categories/tv", "products/42-iphone". Centralizes the /{lang}/{path}
// shape so every generateMetadata builds identical canonical/hreflang URLs.
export function localizedPath(lang: Locale, path: string): string {
  return path ? `/${lang}/${path}` : `/${lang}`;
}

export function hreflangAlternates(path: string): Record<string, string> {
  return Object.fromEntries(locales.map((locale) => [locale, localizedPath(locale, path)]));
}

export function canonicalAlternates(lang: Locale, path: string) {
  return {
    canonical: localizedPath(lang, path),
    languages: hreflangAlternates(path),
  };
}

// Account/session pages: nothing publicly indexable, and most require a
// login a crawler doesn't have — see app/robots.ts for the same list.
export const NOINDEX = { index: false, follow: false } as const;
