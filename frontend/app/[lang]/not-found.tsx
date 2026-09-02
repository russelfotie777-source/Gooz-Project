"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import MaintenanceIllustration from "@/components/MaintenanceIllustration/MaintenanceIllustration";
import styles from "./not-found.module.css";

export default function RootNotFound() {
  const dict = useDictionary();

  return (
    <div className={styles.page}>
      <MaintenanceIllustration className={styles.illustration} />
      <h1 className={styles.title}>{dict.notFoundPage.title}</h1>
      <p className={styles.subtitle}>{dict.notFoundPage.subtitle}</p>
      <div className={styles.actions}>
        <LocaleLink href="/" className={styles.homeLink}>
          {dict.notFoundPage.backHome}
        </LocaleLink>
        <LocaleLink href="/recherche" className={styles.secondaryLink}>
          {dict.notFoundPage.browseCatalog}
        </LocaleLink>
      </div>
    </div>
  );
}
