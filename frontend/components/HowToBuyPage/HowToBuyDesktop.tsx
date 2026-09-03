"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useLang } from "@/lib/i18n/I18nProvider";
import { HOW_TO_BUY } from "@/lib/legal/howToBuy";
import styles from "./HowToBuyDesktop.module.css";

// Desktop "How to buy" guide — same content as HowToBuyPage (mobile), laid
// out with the regular Header/Footer chrome, consistent with the other
// desktop info pages.
export default function HowToBuyDesktop() {
  const lang = useLang();
  const content = HOW_TO_BUY[lang];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <LegalArticle content={content} internalLinks={["deliveryFees", "returnPolicy"]} />
      </main>

      <Footer />
    </div>
  );
}
