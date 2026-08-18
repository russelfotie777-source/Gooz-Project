"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useLang } from "@/lib/i18n/I18nProvider";
import { PRIVACY_POLICY } from "@/lib/legal/privacyPolicy";
import styles from "./PrivacyPolicyDesktop.module.css";

// Desktop privacy policy — same content as PrivacyPolicyPage (mobile), laid
// out with the regular Header/Footer chrome, consistent with the other
// desktop account pages (see AddressesDesktop, OrderHistoryDesktop).
export default function PrivacyPolicyDesktop() {
  const lang = useLang();
  const content = PRIVACY_POLICY[lang];

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <LegalArticle content={content} />
      </main>

      <Footer />
    </div>
  );
}
