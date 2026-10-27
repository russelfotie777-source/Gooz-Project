"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import type { User } from "@/lib/types";
import { HelpIcon, LoginIcon, LogoutIcon, SignupIcon } from "./HeaderIcons";
import styles from "./Header.module.css";

interface AccountMenuProps {
  user: User | null;
  displayName: string;
  onLogout: () => void;
}

export default function AccountMenu({ user, displayName, onLogout }: AccountMenuProps) {
  const dict = useDictionary();

  return (
    <div className={styles.accountWrapper}>
      <LocaleLink href="/compte" className={styles.accountButton} aria-haspopup="menu">
        <span className={styles.accountAvatar}>
          <img src="/icon/header/user.svg" alt="" className={styles.accountAvatarIcon} />
        </span>
        <span>{displayName}</span>
        <img src="/icon/product-detail/chevron-down.svg" alt="" className={`${styles.dropdownChevron} ${styles.chevronLight}`} />
      </LocaleLink>

      <ul className={styles.accountDropdown} role="menu">
        {user ? (
          <li>
            <button type="button" className={styles.accountMenuItem} onClick={onLogout}>
              <LogoutIcon className={`${styles.accountMenuIcon} ${styles.accountMenuIconDanger}`} />
              {dict.header.logout}
            </button>
          </li>
        ) : (
          <>
            <li>
              <LocaleLink href="/connexion" className={styles.accountMenuItem}>
                <LoginIcon className={styles.accountMenuIcon} />
                {dict.header.login}
              </LocaleLink>
            </li>
            <li>
              <LocaleLink href="/inscription" className={styles.accountMenuItem}>
                <SignupIcon className={styles.accountMenuIcon} />
                {dict.header.signup}
              </LocaleLink>
            </li>
          </>
        )}
        <li>
          <LocaleLink href="/aide" className={styles.accountMenuItem}>
            <HelpIcon className={styles.accountMenuIcon} />
            {dict.header.helpCenter}
          </LocaleLink>
        </li>
      </ul>
    </div>
  );
}
