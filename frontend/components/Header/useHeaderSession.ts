"use client";

import { useEffect, useState } from "react";
import { logout as apiLogout } from "@/lib/api";
import { clearSession, getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { useCartCount } from "@/lib/useCartCount";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { splitName } from "@/lib/name";
import { onSessionExpired } from "@/lib/sessionEvents";
import { showToast } from "@/lib/toast";
import type { User } from "@/lib/types";

// Owns the account/cart-badge state together since they share one
// lifecycle: both come from the same session fetch on mount, both reset
// together on logout and on a session expiring mid-visit (401 from
// authedFetch — see lib/sessionEvents). cartCount itself is useCartCount
// (shared with BottomNav's mobile badge).
export function useHeaderSession(cartCountProp: number) {
  const dict = useDictionary();
  const cartCount = useCartCount(cartCountProp);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    setUser(session.user);
  }, []);

  // authedFetch (lib/api.ts) already clears the stored session on any 401 —
  // this just makes sure Header's own copy of that state (derived once on
  // mount, above) doesn't keep showing the account name/dropdown as if
  // nothing happened.
  useEffect(() => {
    return onSessionExpired(() => {
      setUser(null);
    });
  }, []);

  function handleLogout() {
    const session = getSession();
    if (session) apiLogout(session.token);
    clearSession();
    setUser(null);
    notifyCartUpdated(0);
    showToast(dict.session.loggedOut, "success");
  }

  const userNameParts = user ? splitName(user.name) : null;
  const displayName = userNameParts
    ? userNameParts.prenom || userNameParts.nom || dict.header.myAccount
    : dict.header.myAccount;

  return { user, cartCount, displayName, handleLogout };
}
