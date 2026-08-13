import styles from "./Footer.module.css";

const SERVICE_LINKS = [
  "Comment acheter sur Shopitech ?",
  "Contactez-nous",
  "Politique de retour",
  "Centre d'aide",
  "Frais de livraison",
];

const ABOUT_LINKS = [
  "À propos",
  "Politique de confidentialité",
  "Conditions générales d'achat",
  "Conditions générales d'utilisation",
  "Tout sur la livraison",
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <FooterColumn title="Service client" links={SERVICE_LINKS} />
        <FooterColumn title="Qui sommes-nous" links={ABOUT_LINKS} />

        <div className={styles.column}>
          <p className={styles.columnTitle}>Suivez-nous aussi sur</p>
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

          <p className={styles.columnTitle}>Téléchargez notre app sur</p>
          <div className={styles.storeRow}>
            <img src="/icon/footer/store-appstore.svg" alt="App Store" className={styles.storeBadge} />
            <img src="/icon/footer/store-playstore.svg" alt="Play Store" className={styles.storeBadge} />
          </div>
        </div>
      </div>

      <div className={styles.newsletterRow}>
        <div>
          <p className={styles.columnTitle}>Méthode de paiement</p>
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
          <p className={styles.columnTitle}>Rejoindre notre newsletter</p>
          <div className={styles.newsletterField}>
            <input
              type="email"
              placeholder="Entrez votre adresse mail"
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterButton}>
              S'inscrire
            </button>
          </div>
        </form>
      </div>

      <p className={styles.copyright}>© {new Date().getFullYear()} Shopitech. Tous droits réservés.</p>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className={styles.column}>
      <p className={styles.columnTitle}>{title}</p>
      <ul className={styles.linkList}>
        {links.map((link) => (
          <li key={link}>
            <a href="#" className={styles.link}>
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
