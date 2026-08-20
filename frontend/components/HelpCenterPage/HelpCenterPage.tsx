"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav/BottomNav";
import TicketModal from "@/components/TicketModal/TicketModal";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import styles from "./HelpCenterPage.module.css";

// Mobile "Centre d'aide" hub — reached from the dead "Aide" rows in
// ProfileLoggedIn/ProfileLoggedOut. No FAQ content exists yet, so this is a
// hub of links to the info pages that already exist (Footer's
// serviceLinks/aboutLinks cover the same pages) plus the existing contact
// channel (TicketModal), rather than an invented article.
export default function HelpCenterPage() {
  const dict = useDictionary();
  const router = useLocaleRouter();
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
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backButton}
          aria-label={dict.header.back}
          onClick={() => router.back()}
        >
          <img src="/icon/product-detail/back.svg" alt="" className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>{dict.profile.helpCenterTitle}</h1>
        <span className={styles.spacer} aria-hidden />
      </div>

      <main className={styles.main}>
        <p className={styles.subtitle}>{dict.profile.helpCenterPageSubtitle}</p>

        <div className={styles.card}>
          {TOPICS.map((topic, index) => (
            <LocaleLink
              key={topic.href}
              href={topic.href}
              className={`${styles.row} ${index === TOPICS.length - 1 ? styles.rowNoBorder : ""}`}
            >
              <img src="/icon/profile/quiz.svg" alt="" className={styles.rowIcon} />
              <span className={styles.rowTitle}>{topic.label}</span>
              <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
            </LocaleLink>
          ))}
        </div>

        <div className={styles.contactCard}>
          <p className={styles.contactTitle}>{dict.profile.helpCenterContactTitle}</p>
          <button type="button" className={styles.contactButton} onClick={() => setTicketModalOpen(true)}>
            {dict.profile.helpCenterContactAction}
          </button>
        </div>
      </main>

      <BottomNav active="profile" />

      <TicketModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
    </div>
  );
}
