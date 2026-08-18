"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { ALL_ABOUT_DELIVERY } from "@/lib/legal/allAboutDelivery";
import styles from "./AllAboutDeliveryPage.module.css";

// Mobile "All about delivery" page — reached from the "Tout sur la
// livraison" link in the Footer's about-links column. Same
// topBar/back-button/BottomNav convention as the other footer info pages.
export default function AllAboutDeliveryPage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const content = ALL_ABOUT_DELIVERY[lang];

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
          internalLinks={["privacyPolicy", "returnPolicy", "termsOfSale", "deliveryFees"]}
        />
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
