"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef } from "react";
import { useLang } from "./I18nProvider";

// Prefixes internal hrefs ("/cart", "/products/5") with the current locale
// so navigation never silently drops it. External URLs, "#" anchors, and
// already-prefixed hrefs pass through untouched.
export function localizeHref(href: string, lang: string): string {
  if (!href.startsWith("/")) return href;

  // Only the path portion decides whether this is "already prefixed" — a
  // query string tacked onto the bare locale root ("/fr?page=2") used to
  // fail both the exact-match and the startsWith("/fr/") checks (there's no
  // "/" right after "/fr" here, "?" is), double-prefixing it to
  // "/fr/fr?page=2". Found via CatalogueSection/CategoryResults' paginated
  // links, which are exactly this shape.
  const path = href.split(/[?#]/, 1)[0];
  if (path === `/${lang}` || path.startsWith(`/${lang}/`)) return href;
  return `/${lang}${href}`;
}

type LocaleLinkProps = Omit<LinkProps, "href"> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(function LocaleLink(
  { href, ...rest },
  ref
) {
  const lang = useLang();
  return <Link ref={ref} href={localizeHref(href, lang)} {...rest} />;
});

export default LocaleLink;
