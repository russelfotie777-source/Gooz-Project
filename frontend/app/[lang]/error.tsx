"use client";

import { useEffect } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./error.module.css";

// The single safety net for every server page under app/[lang]/ (home,
// categories, product detail, search, ...): each does an unprotected
// await getProducts()/getCategories() at render time, so any backend hiccup
// used to fall straight through to Next's raw default error screen. One
// file here covers all of them at once — see the audit's own note that this
// is the highest-value fix in the whole review.
export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const dict = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{dict.errorBoundary.title}</h1>
      <p className={styles.subtitle}>{dict.errorBoundary.subtitle}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.retryButton} onClick={() => unstable_retry()}>
          {dict.errorBoundary.retry}
        </button>
        <LocaleLink href="/" className={styles.homeLink}>
          {dict.errorBoundary.backHome}
        </LocaleLink>
      </div>
    </div>
  );
}
