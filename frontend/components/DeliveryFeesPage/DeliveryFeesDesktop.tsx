"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useLang } from "@/lib/i18n/I18nProvider";
import { DELIVERY_FEES } from "@/lib/legal/deliveryFees";
import styles from "./DeliveryFeesDesktop.module.css";

// Desktop delivery fees page — same content as DeliveryFeesPage (mobile),
// laid out with the regular Header/Footer chrome, consistent with the other
// desktop legal pages.
export default function DeliveryFeesDesktop() {
  const lang = useLang();
  const content = DELIVERY_FEES[lang];

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <LegalArticle content={content} internalLinks={["termsOfUse"]} />
      </main>

      <Footer />
    </div>
  );
}
