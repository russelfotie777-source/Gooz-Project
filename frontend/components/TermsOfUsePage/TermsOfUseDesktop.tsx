"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useLang } from "@/lib/i18n/I18nProvider";
import { TERMS_OF_USE } from "@/lib/legal/termsOfUse";
import styles from "./TermsOfUseDesktop.module.css";

// Desktop terms of use — same content as TermsOfUsePage (mobile), laid out
// with the regular Header/Footer chrome, consistent with PrivacyPolicyDesktop.
export default function TermsOfUseDesktop() {
  const lang = useLang();
  const content = TERMS_OF_USE[lang];

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <LegalArticle content={content} internalLinks={["privacyPolicy", "returnPolicy", "deliveryFees"]} />
      </main>

      <Footer />
    </div>
  );
}
