"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { TERMS_OF_USE } from "@/lib/legal/termsOfUse";
import styles from "./TermsOfUsePage.module.css";

// Mobile terms of use — reached from the "Conditions générales d'utilisation"
// row in ProfilePage. Same topBar/back-button/BottomNav convention as
// PrivacyPolicyPage and the other account sub-pages, so the "profile" tab
// stays raised instead of defaulting to "home".
export default function TermsOfUsePage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const content = TERMS_OF_USE[lang];

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
          internalLinks={["privacyPolicy", "returnPolicy", "deliveryFees"]}
        />
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
