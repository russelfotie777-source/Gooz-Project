"use client";

import { useState } from "react";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import TicketModal from "@/components/TicketModal/TicketModal";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./HelpCenterDesktop.module.css";

// Desktop "Centre d'aide" hub — same links as HelpCenterPage (mobile), laid
// out as a card grid with Header/Footer chrome, consistent with the other
// desktop account pages (see AddressesDesktop).
export default function HelpCenterDesktop() {
  const dict = useDictionary();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const TOPICS = [
    { label: dict.profile.helpCenterHowToBuy, href: "/comment-acheter" },
    { label: dict.profile.helpCenterDeliveryFees, href: "/frais-livraison" },
    { label: dict.profile.helpCenterAllAboutDelivery, href: "/tout-sur-la-livraison" },
    { label: dict.profile.helpCenterReturnPolicy, href: "/politique-retour" },
    { label: dict.profile.helpCenterPrivacyPolicy, href: "/politique-confidentialite" },
    { label: dict.profile.helpCenterPurchaseTerms, href: "/conditions-achat" },
    { label: dict.profile.helpCenterUseTerms, href: "/conditions-utilisation" },
    { label: dict.profile.helpCenterAboutUs, href: "/a-propos" },
  ];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{dict.profile.helpCenterTitle}</h1>
          <p className={styles.subtitle}>{dict.profile.helpCenterPageSubtitle}</p>
        </div>

        <div className={styles.grid}>
          {TOPICS.map((topic) => (
            <LocaleLink key={topic.href} href={topic.href} className={styles.card}>
              <img src="/icon/profile/quiz.svg" alt="" className={styles.cardIcon} />
              <span className={styles.cardLabel}>{topic.label}</span>
              <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
            </LocaleLink>
          ))}
        </div>

        <div className={styles.contactPanel}>
          <p className={styles.contactTitle}>{dict.profile.helpCenterContactTitle}</p>
          <button type="button" className={styles.contactButton} onClick={() => setTicketModalOpen(true)}>
            {dict.profile.helpCenterContactAction}
          </button>
        </div>
      </main>

      <Footer />

      <TicketModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
    </div>
  );
}
