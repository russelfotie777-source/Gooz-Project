"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useLang } from "@/lib/i18n/I18nProvider";
import { RETURN_POLICY } from "@/lib/legal/returnPolicy";
import styles from "./ReturnPolicyDesktop.module.css";

// Desktop return policy — same content as ReturnPolicyPage (mobile), laid
// out with the regular Header/Footer chrome, consistent with
// PrivacyPolicyDesktop and TermsOfUseDesktop.
export default function ReturnPolicyDesktop() {
  const lang = useLang();
  const content = RETURN_POLICY[lang];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <LegalArticle content={content} internalLinks={["termsOfUse"]} />
      </main>

      <Footer />
    </div>
  );
}
