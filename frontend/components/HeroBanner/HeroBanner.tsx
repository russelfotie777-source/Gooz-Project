import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Shop<span className={styles.titleAccent}>itech</span>
        </h1>
        <p className={styles.subtitle}>Découvrez un univers d&apos;articles</p>
        <p className={styles.description}>
          Téléphonie, informatique, sécurité et électroménager : tout ce dont
          vous avez besoin, livré rapidement à Douala.
        </p>
        <button type="button" className={styles.cta}>
          Plus de produits
        </button>

        <div className={styles.dots} aria-hidden="true">
          <span className={`${styles.dot} ${styles.dotActive}`} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>

      <div className={styles.imageWrapper} aria-hidden="true">
        <img src="/images/hero/circle-decoration.svg" alt="" className={styles.circleDecoration} />
        <img src="/images/hero/product-camera.png" alt="" className={styles.productImage} />
      </div>

      <button type="button" className={`${styles.navButton} ${styles.navButtonPrev}`} aria-label="Précédent">
        <img src="/images/hero/arrow-bg.svg" alt="" className={styles.navButtonBg} />
        <img
          src="/images/hero/arrow-chevron.svg"
          alt=""
          className={`${styles.navButtonIcon} ${styles.navButtonIconFlipped}`}
        />
      </button>
      <button type="button" className={`${styles.navButton} ${styles.navButtonNext}`} aria-label="Suivant">
        <img src="/images/hero/arrow-bg.svg" alt="" className={styles.navButtonBg} />
        <img src="/images/hero/arrow-chevron.svg" alt="" className={styles.navButtonIcon} />
      </button>
    </section>
  );
}
