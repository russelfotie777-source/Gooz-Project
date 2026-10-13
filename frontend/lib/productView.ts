// sessionStorage, not localStorage, on purpose: "also viewed" correlates
// products seen in the same browsing visit — it's supposed to reset when
// the tab closes, same as the real-world "I was browsing and also looked
// at..." signal it's modeling.
const SESSION_TOKEN_KEY = "shopitech-view-session";

export function getViewSessionToken(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (existing) return existing;

    const token = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    return token;
  } catch {
    // Storage unavailable (private mode, blocked) — still usable for the
    // single call that needs it this render, just not remembered.
    return crypto.randomUUID();
  }
}

// Recently viewed — deliberately separate from the session token above:
// this is the shopper's own history (persists across visits, localStorage),
// not a cross-shopper correlation signal.
const RECENTLY_VIEWED_KEY = "shopitech-recently-viewed";
const MAX_RECENTLY_VIEWED = 12;

export function recordRecentlyViewed(productId: number): void {
  try {
    const ids = readRecentlyViewedIds().filter((id) => id !== productId);
    ids.unshift(productId);
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids.slice(0, MAX_RECENTLY_VIEWED)));
  } catch {
    // Best-effort only.
  }
}

function readRecentlyViewedIds(): number[] {
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : [];
  } catch {
    return [];
  }
}

export function getRecentlyViewedIds(excludeProductId: number, limit = 8): number[] {
  return readRecentlyViewedIds()
    .filter((id) => id !== excludeProductId)
    .slice(0, limit);
}
