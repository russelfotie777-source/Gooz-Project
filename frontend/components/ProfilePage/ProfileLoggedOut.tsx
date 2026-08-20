"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./ProfilePage.module.css";

interface ProfileLoggedOutProps {
  onToggleLanguage: () => void;
}

export default function ProfileLoggedOut({ onToggleLanguage }: ProfileLoggedOutProps) {
  const dict = useDictionary();

  return (
    <>
      <div className={styles.userCard}>
        <span className={styles.avatarPlaceholder}>
          <img src="/icon/profile/avatar-placeholder.svg" alt="" className={styles.avatarPlaceholderIcon} />
        </span>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{dict.profile.loggedOutName}</p>
          <p className={styles.userEmail}>{dict.profile.notConnected}</p>
        </div>
      </div>

      <div className={styles.card}>
        <LocaleLink href="/aide" className={`${styles.row} ${styles.rowButton} ${styles.rowNoBorder}`}>
          <img src="/icon/profile/quiz.svg" alt="" className={styles.rowIcon} />
          <div className={styles.rowText}>
            <p className={styles.rowTitle}>{dict.profile.helpCenterTitle}</p>
            <p className={styles.rowSubtitle}>{dict.profile.helpCenterSubtitle}</p>
          </div>
          <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
        </LocaleLink>
      </div>

      <div className={styles.card}>
        <button
          type="button"
          className={`${styles.row} ${styles.rowButton} ${styles.rowNoBorder}`}
          onClick={onToggleLanguage}
        >
          <img src="/icon/profile/g-translate.svg" alt="" className={styles.rowIcon} />
          <div className={styles.rowText}>
            <p className={styles.rowTitle}>{dict.profile.language}</p>
            <p className={styles.rowSubtitle}>{dict.profile.languageName}</p>
          </div>
          <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
        </button>
      </div>

      <LocaleLink href="/connexion" className={styles.loginCard}>
        <img src="/icon/profile/login-icon.svg" alt="" className={styles.loginIcon} />
        <span className={styles.loginLabel}>{dict.profile.loginSignup}</span>
        <img src="/icon/profile/arrow-forward-ios-orange.svg" alt="" className={styles.chevron} />
      </LocaleLink>
    </>
  );
}
