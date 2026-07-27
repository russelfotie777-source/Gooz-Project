import styles from "./BottomNav.module.css";

// Real mobile nav bar from Figma (node 372:242, frame 372:185) — floating
// orange circular "Accueil" button raised above a white pill bar, with plain
// cart/bell/user icons alongside (no text labels).
export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      <div className={styles.bar}>
        <div className={styles.homeSlot}>
          <img src="/icon/bottom-nav/nav-shadow.svg" alt="" className={styles.homeShadow} aria-hidden />
          <button type="button" className={styles.homeCircle} aria-label="Accueil" aria-current="page">
            <img src="/icon/bottom-nav/nav-home.svg" alt="" className={styles.homeIcon} />
          </button>
        </div>

        <button type="button" className={styles.item} aria-label="Panier">
          <img src="/icon/bottom-nav/nav-cart.svg" alt="" className={styles.icon} />
        </button>

        <button type="button" className={styles.item} aria-label="Notifications">
          <img src="/icon/bottom-nav/nav-bell.svg" alt="" className={styles.icon} />
        </button>

        <button type="button" className={styles.item} aria-label="Compte">
          <img src="/icon/bottom-nav/nav-user.svg" alt="" className={styles.icon} />
        </button>
      </div>
    </nav>
  );
}
