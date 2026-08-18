"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { HOW_TO_BUY } from "@/lib/legal/howToBuy";
import styles from "./HowToBuyPage.module.css";

// Mobile "How to buy" guide — reached from the "Comment acheter sur
// Shopitech ?" link in the Footer's service-links column. Same
// topBar/back-button/BottomNav convention as the other footer info pages.
export default function HowToBuyPage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const content = HOW_TO_BUY[lang];

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
        <LegalArticle content={content} showTitle={false} internalLinks={["deliveryFees", "returnPolicy"]} />
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
