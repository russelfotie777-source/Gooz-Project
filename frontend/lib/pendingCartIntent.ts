// When a guest taps the wishlist heart, they get sent to /connexion
// (favorites require auth; adding to the cart itself doesn't anymore — see
// lib/guestCart.ts) — but used to just lose that action entirely: after
// logging in they landed on /compte and had to go find the product again.
// This stashes what they were trying to do (sessionStorage, not
// localStorage — it's only relevant to this one visit) so the auth pages
// can replay it once login succeeds and send the shopper back to where
// they actually were, see resolvePostLoginRedirect.
const STORAGE_KEY = "shopitech-pending-cart-intent";

export interface PendingCartIntent {
  type: "toggle-wishlist";
  productId: number;
  /** Full, already locale-prefixed path to return to otherwise. */
  returnPath: string;
}

export function savePendingCartIntent(intent: PendingCartIntent): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // Storage can throw (private browsing, quota) — worst case the shopper
    // just lands on /compte after login like before this existed.
  }
}

export function takePendingCartIntent(): PendingCartIntent | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as PendingCartIntent;
  } catch {
    return null;
  }
}
