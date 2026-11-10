"use client";

import { useEffect, useState } from "react";
import { getCart } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { onCartUpdated } from "@/lib/cartEvents";
import { getGuestCartLineCount } from "@/lib/guestCart";
import { onSessionExpired } from "@/lib/sessionEvents";

// Shared by every place that shows a cart badge (desktop Header, mobile
// BottomNav) so they all read the same live count instead of each
// duplicating the fetch-on-mount + cartEvents subscription. A logged-out
// shopper still has a real cart (see lib/guestCart.ts) — it just lives in
// localStorage instead of the server — so this reads from there instead of
// going straight to 0.
export function useCartCount(initial = 0): number {
  const [cartCount, setCartCount] = useState(initial);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setCartCount(getGuestCartLineCount());
      return onCartUpdated(setCartCount);
    }

    getCart(session.token)
      .then((cart) => setCartCount(cart.items.length))
      .catch(() => {});

    return onCartUpdated(setCartCount);
  }, []);

  useEffect(() => {
    return onSessionExpired(() => setCartCount(0));
  }, []);

  return cartCount;
}
