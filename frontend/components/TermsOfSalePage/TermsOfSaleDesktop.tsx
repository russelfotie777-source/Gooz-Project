"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useLang } from "@/lib/i18n/I18nProvider";
import { TERMS_OF_SALE } from "@/lib/legal/termsOfSale";
import styles from "./TermsOfSaleDesktop.module.css";

// Desktop terms of sale — same content as TermsOfSalePage (mobile), laid out
// with the regular Header/Footer chrome, consistent with the other desktop
// legal pages.
export default function TermsOfSaleDesktop() {
  const lang = useLang();
  const content = TERMS_OF_SALE[lang];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <LegalArticle content={content} internalLinks={["termsOfUse", "returnPolicy", "deliveryFees"]} />
      </main>

      <Footer />
    </div>
  );
}
