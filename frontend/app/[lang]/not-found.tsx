"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./not-found.module.css";

export default function RootNotFound() {
  const dict = useDictionary();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{dict.notFoundPage.title}</h1>
      <p className={styles.subtitle}>{dict.notFoundPage.subtitle}</p>
      <LocaleLink href="/" className={styles.homeLink}>
        {dict.notFoundPage.backHome}
      </LocaleLink>
    </div>
  );
}
