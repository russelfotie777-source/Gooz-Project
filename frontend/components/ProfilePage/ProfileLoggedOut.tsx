import Link from "next/link";
import styles from "./ProfilePage.module.css";

export default function ProfileLoggedOut() {
  return (
    <>
      <div className={styles.userCard}>
        <span className={styles.avatarPlaceholder}>
          <img src="/icon/profile/avatar-placeholder.svg" alt="" className={styles.avatarPlaceholderIcon} />
        </span>
        <div className={styles.userInfo}>
          <p className={styles.userName}>Utilisateur</p>
          <p className={styles.userEmail}>Non connecté</p>
        </div>
        <button type="button" className={styles.editButton} aria-label="Modifier le profil">
          <img src="/icon/profile/person-edit.svg" alt="" className={styles.editIcon} />
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.row}>
          <img src="/icon/profile/quiz.svg" alt="" className={styles.rowIcon} />
          <div className={styles.rowText}>
            <p className={styles.rowTitle}>Centre d&apos;aide</p>
            <p className={styles.rowSubtitle}>Besoin d&apos;aide, n&apos;hésitez pas à nous contacter</p>
          </div>
          <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.row} ${styles.rowNoBorder}`}>
          <img src="/icon/profile/g-translate.svg" alt="" className={styles.rowIcon} />
          <div className={styles.rowText}>
            <p className={styles.rowTitle}>Langue</p>
            <p className={styles.rowSubtitle}>Français</p>
          </div>
          <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
        </div>
      </div>

      <Link href="/connexion" className={styles.loginCard}>
        <img src="/icon/profile/login-icon.svg" alt="" className={styles.loginIcon} />
        <span className={styles.loginLabel}>Se connecter / S&apos;inscrire</span>
        <img src="/icon/profile/arrow-forward-ios-orange.svg" alt="" className={styles.chevron} />
      </Link>
    </>
  );
}
