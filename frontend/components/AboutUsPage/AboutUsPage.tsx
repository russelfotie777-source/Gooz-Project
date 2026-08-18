"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { ABOUT_US } from "@/lib/legal/aboutUs";
import styles from "./AboutUsPage.module.css";

// Mobile "About us" page — reached from the "À propos" link in the Footer's
// about-links column. Same topBar/back-button/BottomNav convention as the
// other footer info pages.
export default function AboutUsPage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const content = ABOUT_US[lang];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backButton}
          aria-label={dict.header.back}
          onClick={() => router.back()}
        >
          <img src="/icon/product-detail/back.svg" alt="" className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>{content.title}</h1>
        <span className={styles.spacer} aria-hidden />
      </div>

      <main className={styles.main}>
        <LegalArticle
          content={content}
          showTitle={false}
          internalLinks={["deliveryFees", "allAboutDelivery"]}
        />
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
