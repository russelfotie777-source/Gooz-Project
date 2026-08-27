"use client";

import { useEffect, useState } from "react";
import { getFavorites } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { onFavoritesUpdated, primeFavoriteIds } from "@/lib/favoritesStore";
import type { Favorite } from "@/lib/types";

// Shared by FavoritesPage (mobile) and FavoritesDesktop: the customer's own
// favorited products, backed by GET /favorites (auth required, same
// session-token pattern as orders/notifications — see useOrders.ts).
//
// Unlike those, this list doesn't need its own remove action: each favorite
// is rendered via the real ProductCard, whose heart button already
// unfavorites through the shared favoritesStore — this hook just listens for
// that event and drops the item, the same way Header reacts to cartEvents.
export function useFavorites() {
  const [status, setStatus] = useState<"loading" | "loggedOut" | "ready" | "error">("loading");
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setStatus("loggedOut");
      return;
    }

    getFavorites(session.token)
      .then((list) => {
        setFavorites(list);
        primeFavoriteIds(new Set(list.map((favorite) => favorite.product.id)));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return onFavoritesUpdated((ids) => {
      setFavorites((current) => current.filter((favorite) => ids.has(favorite.product.id)));
    });
  }, []);

  return { status, favorites };
}
