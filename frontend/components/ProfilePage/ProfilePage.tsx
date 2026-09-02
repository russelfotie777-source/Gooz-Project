"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav/BottomNav";
import CompletePhoneModal from "@/components/CompletePhoneModal/CompletePhoneModal";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { applyTheme, currentTheme } from "@/lib/theme";
import ProfileLoggedIn from "./ProfileLoggedIn";
import ProfileLoggedOut from "./ProfileLoggedOut";
import { useProfileSession } from "./useProfileSession";
import styles from "./ProfilePage.module.css";

// Figma mobile node 674:1019 (connecté) / 731:779 (non connecté) — mobile
// only, reached from the BottomNav profile icon. Login/inscription are wired
// to the real API (see AuthMobileFlow); session handling (getMe revalidation,
// logout, language toggle) lives in useProfileSession, shared with the
// desktop counterpart (ProfileDesktop). The theme button (.themeButton) was
// already in the design (brightness icon) but unwired — it's the dark-mode
// toggle for this screen, same lib/theme.ts as components/ThemeToggle.
export default function ProfilePage() {
  const dict = useDictionary();
  const { user, handleLogout, toggleLanguage, updateUser } = useProfileSession();
  // Starts "light" (matching the server) and corrects post-mount — see
  // ThemeToggle's comment for why reading currentTheme() straight into
  // useState causes a worse hydration mismatch than this one-tick flash.
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>{dict.profile.title}</h1>
        <button type="button" className={styles.themeButton} onClick={toggleTheme} aria-label={dict.profile.theme}>
          <img
            src="/icon/profile/brightness4.svg"
            alt=""
            className={styles.themeIcon}
            style={theme === "dark" ? { filter: "invert(1)" } : undefined}
          />
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
