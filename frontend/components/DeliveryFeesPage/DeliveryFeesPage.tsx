"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { DELIVERY_FEES } from "@/lib/legal/deliveryFees";
import styles from "./DeliveryFeesPage.module.css";

// Mobile delivery fees page — reached from the "Frais de livraison" link in
// the Footer's service-links column. Same topBar/back-button/BottomNav
// convention as PrivacyPolicyPage, TermsOfUsePage and ReturnPolicyPage.
export default function DeliveryFeesPage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const content = DELIVERY_FEES[lang];

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
        <LegalArticle content={content} showTitle={false} internalLinks={["termsOfUse"]} />
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
