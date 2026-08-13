import type { User } from "@/lib/types";
import styles from "./ProfilePage.module.css";

interface ProfileLoggedInProps {
  user: User;
  onLogout: () => void;
}

const ACCOUNT_ROWS = [
  {
    icon: "/icon/profile/edit-location-alt.svg",
    title: "Adresse de livraison",
    subtitle: "Modifier votre adresse de livraison par défaut",
  },
  {
    icon: "/icon/profile/credit-card.svg",
    iconClassName: "iconTilted",
    title: "Historique des paiements",
    subtitle: "Consulter tous vos anciens paiements",
  },
  {
    icon: "/icon/profile/delivery-truck-bolt.svg",
    title: "Historique des commandes",
    subtitle: "Consulter toutes vos anciennes commandes",
  },
  {
    icon: "/icon/profile/g-translate.svg",
    title: "Langue",
    subtitle: "Français",
  },
];

export default function ProfileLoggedIn({ user, onLogout }: ProfileLoggedInProps) {
  const supportRows = [
    { icon: "/icon/profile/support-agent.svg", title: "Nous contacter" },
    { icon: "/icon/profile/quiz.svg", title: "Besoins d'aide" },
    { icon: "/icon/profile/security.svg", title: "Politique de confidentialité" },
    { icon: "/icon/profile/verified.svg", title: "Conditions d'utilisation" },
    { icon: "/icon/profile/logout.svg", title: "Se déconnecter", onClick: onLogout },
  ];

  return (
    <>
      <div className={styles.userCard}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon/profile/avatar-photo.png" alt="" className={styles.avatarPhoto} />
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.userEmail}>{user.phone}</p>
        </div>
        <button type="button" className={styles.editButton} aria-label="Modifier le profil">
          <img src="/icon/profile/person-edit.svg" alt="" className={styles.editIcon} />
        </button>
      </div>

      <div className={styles.card}>
        {ACCOUNT_ROWS.map((row, index) => (
          <div key={row.title} className={`${styles.row} ${index === ACCOUNT_ROWS.length - 1 ? styles.rowNoBorder : ""}`}>
            <img
              src={row.icon}
              alt=""
              className={`${styles.rowIcon} ${row.iconClassName === "iconTilted" ? styles.rowIconTilted : ""}`}
            />
            <div className={styles.rowText}>
              <p className={styles.rowTitle}>{row.title}</p>
              <p className={styles.rowSubtitle}>{row.subtitle}</p>
            </div>
            <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {supportRows.map((row, index) => (
          <button
            key={row.title}
            type="button"
            className={`${styles.row} ${styles.rowButton} ${index === supportRows.length - 1 ? styles.rowNoBorder : ""}`}
            onClick={row.onClick}
          >
            <img src={row.icon} alt="" className={styles.rowIcon} />
            <div className={styles.rowText}>
              <p className={styles.rowTitleOnly}>{row.title}</p>
            </div>
            <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
          </button>
        ))}
      </div>
    </>
  );
}
