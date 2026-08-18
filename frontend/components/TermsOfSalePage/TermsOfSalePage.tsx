"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { TERMS_OF_SALE } from "@/lib/legal/termsOfSale";
import styles from "./TermsOfSalePage.module.css";

// Mobile terms of sale — reached from the "Conditions générales d'achat"
// link in the Footer's about-links column. Same topBar/back-button/BottomNav
// convention as the other legal sub-pages.
export default function TermsOfSalePage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const content = TERMS_OF_SALE[lang];

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
          internalLinks={["termsOfUse", "returnPolicy", "deliveryFees"]}
        />
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
