"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import CompletePhoneModal from "@/components/CompletePhoneModal/CompletePhoneModal";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import ProfileLoggedIn from "./ProfileLoggedIn";
import ProfileLoggedOut from "./ProfileLoggedOut";
import { useProfileSession } from "./useProfileSession";
import styles from "./ProfilePage.module.css";

// Figma mobile node 674:1019 (connecté) / 731:779 (non connecté) — mobile
// only, reached from the BottomNav profile icon. Login/inscription are wired
// to the real API (see AuthMobileFlow); session handling (getMe revalidation,
// logout, language toggle) lives in useProfileSession, shared with the
// desktop counterpart (ProfileDesktop).
export default function ProfilePage() {
  const dict = useDictionary();
  const { user, handleLogout, toggleLanguage, updateUser } = useProfileSession();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>{dict.profile.title}</h1>
        <button type="button" className={styles.themeButton} aria-label={dict.profile.theme}>
          <img src="/icon/profile/brightness4.svg" alt="" className={styles.themeIcon} />
        </button>
      </div>

      <main className={styles.main}>
        {user ? (
          <ProfileLoggedIn
            user={user}
            onLogout={handleLogout}
            onToggleLanguage={toggleLanguage}
            onProfileUpdated={updateUser}
          />
        ) : (
          <ProfileLoggedOut onToggleLanguage={toggleLanguage} />
        )}
      </main>

      <BottomNav active="profile" />
      <CompletePhoneModal user={user} onUpdated={updateUser} />
    </div>
  );
}
