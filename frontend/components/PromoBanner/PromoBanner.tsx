import styles from "./PromoBanner.module.css";

// Figma desktop node 907:1490 (real ad creative). The mobile frame's
// equivalent (node 973:2388) was left empty in the design, but the same
// creative reads fine at mobile width, so it's shown responsively here too.
export default function PromoBanner() {
  return (
    <div className={styles.wrapper}>
      <img src="/images/promo/camon-banner.png" alt="Publicité CAMON Slim" className={styles.image} />
    </div>
  );
}
