import { addFavorite, getFavorites, removeFavorite } from "./api";

// Shared across every mounted ProductCard (and the favorites list page) so a
// catalog grid of a dozen+ products doesn't fire a dozen+ redundant
// GET /favorites calls on mount — loaded once per session, then kept in sync
// via the event below whenever any card (or the favorites page itself)
// toggles one. Mirrors the cartEvents.ts pub/sub pattern used for the
// header's cart badge, since favorite state is needed by many independent
// component instances at once, unlike cart count (a single Header).
const FAVORITES_UPDATED_EVENT = "shopitech:favorites-updated";

let cache: Set<number> | null = null;
let inFlight: Promise<Set<number>> | null = null;

function notifyFavoritesUpdated(ids: Set<number>): void {
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT, { detail: { ids } }));
}

export function onFavoritesUpdated(handler: (ids: Set<number>) => void): () => void {
  function listener(e: Event) {
    handler((e as CustomEvent<{ ids: Set<number> }>).detail.ids);
  }
  window.addEventListener(FAVORITES_UPDATED_EVENT, listener);
  return () => window.removeEventListener(FAVORITES_UPDATED_EVENT, listener);
}

export function loadFavoriteIds(token: string): Promise<Set<number>> {
  if (cache) return Promise.resolve(cache);
  if (inFlight) return inFlight;

  inFlight = getFavorites(token)
    .then((favorites) => {
      cache = new Set(favorites.map((favorite) => favorite.product.id));
      inFlight = null;
      return cache;
    })
    .catch((err) => {
      inFlight = null;
      throw err;
    });

  return inFlight;
}

// Called by the favorites list page after its own full fetch — that fetch is
// already an authoritative snapshot, so every ProductCard it renders can
// trust it instead of firing a second, redundant GET /favorites.
export function primeFavoriteIds(ids: Set<number>): void {
  cache = ids;
}

export function clearFavoritesCache(): void {
  cache = null;
  inFlight = null;
}

export async function toggleFavorite(token: string, productId: number, nextIsFavorite: boolean): Promise<void> {
  if (nextIsFavorite) {
    await addFavorite(token, productId);
  } else {
    await removeFavorite(token, productId);
  }

  if (!cache) cache = new Set();
  if (nextIsFavorite) cache.add(productId);
  else cache.delete(productId);

  notifyFavoritesUpdated(new Set(cache));
}
