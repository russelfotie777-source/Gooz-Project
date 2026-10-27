"use client";

import { useEffect, useState } from "react";
import { getCart, logout as apiLogout } from "@/lib/api";
import { clearSession, getSession } from "@/lib/auth";
import { notifyCartUpdated, onCartUpdated } from "@/lib/cartEvents";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { splitName } from "@/lib/name";
import { onSessionExpired } from "@/lib/sessionEvents";
import { showToast } from "@/lib/toast";
import type { User } from "@/lib/types";

// Owns the account/cart-badge state together since they share one
// lifecycle: both come from the same session fetch on mount, both reset
// together on logout and on a session expiring mid-visit (401 from
// authedFetch — see lib/sessionEvents). cartCount is also kept live via
// cartEvents, since cart mutations happen in components (ProductDetail,
// CartItems) that have no other relationship to Header.
export function useHeaderSession(cartCountProp: number) {
  const dict = useDictionary();
  const [cartCount, setCartCount] = useState(cartCountProp);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    setUser(session.user);

    getCart(session.token)
      .then((cart) => setCartCount(cart.items.length))
      .catch(() => {});

    return onCartUpdated(setCartCount);
  }, []);

  // authedFetch (lib/api.ts) already clears the stored session on any 401 —
  // this just makes sure Header's own copy of that state (derived once on
  // mount, above) doesn't keep showing the account name/dropdown as if
  // nothing happened.
  useEffect(() => {
    return onSessionExpired(() => {
      setUser(null);
      setCartCount(0);
    });
  }, []);

  function handleLogout() {
    const session = getSession();
    if (session) apiLogout(session.token);
    clearSession();
    setUser(null);
    setCartCount(0);
    notifyCartUpdated(0);
    showToast(dict.session.loggedOut, "success");
  }

  const userNameParts = user ? splitName(user.name) : null;
  const displayName = userNameParts
    ? userNameParts.prenom || userNameParts.nom || dict.header.myAccount
    : dict.header.myAccount;

  return { user, cartCount, displayName, handleLogout };
}
