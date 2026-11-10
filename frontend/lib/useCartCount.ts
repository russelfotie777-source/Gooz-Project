"use client";

import { useEffect, useState } from "react";
import { getCart } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { onCartUpdated } from "@/lib/cartEvents";
import { onSessionExpired } from "@/lib/sessionEvents";

// Shared by every place that shows a cart badge (desktop Header, mobile
// BottomNav) so they all read the same live count instead of each
// duplicating the fetch-on-mount + cartEvents subscription.
export function useCartCount(initial = 0): number {
  const [cartCount, setCartCount] = useState(initial);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

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
