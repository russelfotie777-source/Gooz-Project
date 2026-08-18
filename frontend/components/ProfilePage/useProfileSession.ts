"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe, logout as apiLogout } from "@/lib/api";
import { clearSession, getSession, saveSession } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { useLang } from "@/lib/i18n/I18nProvider";
import type { User } from "@/lib/types";

// Shared by ProfilePage (mobile) and ProfileDesktop: reads the stored
// session, re-validates it against GET /me (API.md: the recommended way to
// check a stored token is still good), and exposes logout + a language
// toggle. The local copy renders immediately so a valid session never
// flashes a logged-out state while /me is in flight — it only reverts if
// /me actually rejects the token.
export function useProfileSession() {
  const [user, setUser] = useState<User | null>(null);
  const lang = useLang();
  const pathname = usePathname();
  const router = useRouter();

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

  // Only two locales exist, so the language row toggles straight to the
  // other one instead of opening a picker — same cookie + URL-prefix swap
  // as the Header's language switcher (proxy.ts reads that cookie next visit).
  function toggleLanguage() {
    const newLang: Locale = lang === "fr" ? "en" : "fr";
    document.cookie = `shopitech-locale=${newLang}; path=/; max-age=31536000`;
    const rest = pathname.startsWith(`/${lang}`) ? pathname.slice(`/${lang}`.length) : pathname;
    router.push(`/${newLang}${rest || ""}`);
  }

  return { user, handleLogout, toggleLanguage };
}
