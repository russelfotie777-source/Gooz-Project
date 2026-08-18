"use client";

import { useRouter } from "next/navigation";
import { useLang } from "./I18nProvider";
import { localizeHref } from "./LocaleLink";

// Same idea as LocaleLink, for imperative navigation (router.push after a
// form submit, a redirect guard, etc.).
export function useLocaleRouter() {
  const router = useRouter();
  const lang = useLang();

  return {
    push: (href: string) => router.push(localizeHref(href, lang)),
    replace: (href: string) => router.replace(localizeHref(href, lang)),
    back: () => router.back(),
  };
}
