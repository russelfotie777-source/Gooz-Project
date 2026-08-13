"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav/BottomNav";
import { getMe, logout as apiLogout } from "@/lib/api";
import { clearSession, getSession, saveSession } from "@/lib/auth";
import type { User } from "@/lib/types";
import ProfileLoggedIn from "./ProfileLoggedIn";
import ProfileLoggedOut from "./ProfileLoggedOut";
import styles from "./ProfilePage.module.css";

// Figma mobile node 674:1019 (connecté) / 731:779 (non connecté) — mobile
// only, reached from the BottomNav profile icon. Login/inscription are wired
// to the real API (see AuthMobileFlow) and the token+user are read back here
// from lib/auth's localStorage session. On mount, GET /me re-validates that
// token and refreshes the user's data (API.md: the recommended way to check
// a stored token is still good) — the local copy is rendered immediately
// first so a valid session never flashes a logged-out state while that
// check is in flight; it only reverts if /me actually rejects the token.
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    setUser(session.user);

    getMe(session.token)
      .then((freshUser) => {
        saveSession({ token: session.token, user: freshUser });
        setUser(freshUser);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      });
  }, []);

  function handleLogout() {
    const token = getSession()?.token;
    if (token) apiLogout(token);
    clearSession();
    setUser(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Profil</h1>
        <button type="button" className={styles.themeButton} aria-label="Thème">
          <img src="/icon/profile/brightness4.svg" alt="" className={styles.themeIcon} />
        </button>
      </div>

      <main className={styles.main}>
        {user ? <ProfileLoggedIn user={user} onLogout={handleLogout} /> : <ProfileLoggedOut />}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
