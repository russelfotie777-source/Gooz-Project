"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { PRIVACY_POLICY } from "@/lib/legal/privacyPolicy";
import styles from "./PrivacyPolicyPage.module.css";

// Mobile privacy policy — reached from the "Politique de confidentialité"
// row in ProfilePage, so it uses the same topBar/back-button/BottomNav
// convention as the other account sub-pages (AddressesPage, OrderHistoryPage)
// instead of the full Header, and keeps the "profile" tab raised in the
// bottom nav rather than defaulting to "home".
export default function PrivacyPolicyPage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const content = PRIVACY_POLICY[lang];

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
        <LegalArticle content={content} showTitle={false} />
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
