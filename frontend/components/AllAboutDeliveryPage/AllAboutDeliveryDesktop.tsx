"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LegalArticle from "@/components/LegalArticle/LegalArticle";
import { useLang } from "@/lib/i18n/I18nProvider";
import { ALL_ABOUT_DELIVERY } from "@/lib/legal/allAboutDelivery";
import styles from "./AllAboutDeliveryDesktop.module.css";

// Desktop "All about delivery" page — same content as
// AllAboutDeliveryPage (mobile), laid out with the regular Header/Footer
// chrome, consistent with the other desktop info pages.
export default function AllAboutDeliveryDesktop() {
  const lang = useLang();
  const content = ALL_ABOUT_DELIVERY[lang];

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <LegalArticle
          content={content}
          internalLinks={["privacyPolicy", "returnPolicy", "termsOfSale", "deliveryFees"]}
        />
      </main>

      <Footer />
    </div>
  );
}
