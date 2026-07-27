import styles from "./PromoBanner.module.css";

// Figma desktop node 907:1490 (real ad creative). The mobile equivalent
// (node 973:2388) is an empty placeholder in the design, so mobile keeps
// a blank slot here rather than showing invented content.
export default function PromoBanner() {
  return (
    <div className={styles.wrapper}>
      <img src="/images/promo/camon-banner.png" alt="Publicité CAMON Slim" className={styles.image} />
      <div className={styles.mobilePlaceholder} aria-hidden="true" />
    </div>
  );
}
