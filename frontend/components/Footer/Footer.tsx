"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import ScrollToTopButton from "./ScrollToTopButton";
import styles from "./Footer.module.css";

export default function Footer() {
  const dict = useDictionary();

  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <FooterColumn title={dict.footer.customerService} links={dict.footer.serviceLinks} />
        <FooterColumn title={dict.footer.aboutUs} links={dict.footer.aboutLinks} />

        <div className={styles.column}>
          <p className={styles.columnTitle}>{dict.footer.followUs}</p>
          <div className={styles.socialRow}>
            <a href="#" className={styles.socialIcon} aria-label="Facebook">
              <img src="/icon/footer/social-facebook.svg" alt="" className={styles.socialGlyph} />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="Instagram">
              <img src="/icon/footer/social-instagram.svg" alt="" className={styles.socialGlyph} />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="TikTok">
              <img src="/icon/footer/social-tiktok.svg" alt="" className={styles.socialGlyph} />
            </a>
          </div>

          <p className={styles.columnTitle}>{dict.footer.downloadApp}</p>
          <div className={styles.storeRow}>
            <img src="/icon/footer/store-appstore.svg" alt="App Store" className={styles.storeBadge} />
            <img src="/icon/footer/store-playstore.svg" alt="Play Store" className={styles.storeBadge} />
          </div>
        </div>
      </div>

      <div className={styles.newsletterRow}>
        <div>
          <p className={styles.columnTitle}>{dict.footer.paymentMethod}</p>
          <div className={styles.paymentRow}>
            <img src="/icon/footer/payment-mtn.png" alt="MTN Mobile Money" className={styles.paymentBadge} />
            <img src="/icon/footer/payment-orange.png" alt="Orange Money" className={styles.paymentBadge} />
            <div className={styles.paymentIcon} aria-label="Carte bancaire">
              <img src="/icon/footer/payment-card-1.svg" alt="" className={styles.paymentIconCard} />
              <img src="/icon/footer/payment-card-2.svg" alt="" className={styles.paymentIconHand} />
            </div>
          </div>
        </div>

        <form className={styles.newsletterForm}>
          <p className={styles.columnTitle}>{dict.footer.newsletter}</p>
          <div className={styles.newsletterField}>
            <input
              type="email"
              placeholder={dict.footer.newsletterPlaceholder}
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterButton}>
              {dict.footer.subscribe}
            </button>
          </div>
        </form>
      </div>

      <p className={styles.copyright}>
        © {new Date().getFullYear()} Shopitech. {dict.footer.copyright}
      </p>

      <ScrollToTopButton />
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div className={styles.column}>
      <p className={styles.columnTitle}>{title}</p>
      <ul className={styles.linkList}>
        {links.map((link) => (
          <li key={link.label}>
            <LocaleLink href={link.href} className={styles.link}>
              {link.label}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
