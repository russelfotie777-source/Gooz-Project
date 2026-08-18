"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useLang } from "@/lib/i18n/I18nProvider";
import { ABOUT_US } from "@/lib/legal/aboutUs";
import styles from "./AboutUsDesktop.module.css";

// Desktop "About us" page — same content as AboutUsPage (mobile), laid out
// with the regular Header/Footer chrome, consistent with the other desktop
// info pages.
export default function AboutUsDesktop() {
  const lang = useLang();
  const content = ABOUT_US[lang];

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <LegalArticle content={content} internalLinks={["deliveryFees", "allAboutDelivery"]} />
      </main>

      <Footer />
    </div>
  );
}
