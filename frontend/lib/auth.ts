import { clearFavoritesCache } from "./favoritesStore";
import type { User } from "./types";

// Sanctum issues a Bearer token, not a session cookie (API.md §1), so it has
// to be stored client-side ourselves and sent as `Authorization: Bearer` on
// future authenticated requests. localStorage is the pragmatic option for a
// browser PWA (the API doc's "avoid localStorage" advice targets the native
// app wrapper, which has Keychain/SecureStore instead).
const STORAGE_KEY = "shopitech-auth";

interface StoredSession {
  token: string;
  user: User;
}

export function saveSession(session: StoredSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function isValidSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredSession>;
  if (typeof candidate.token !== "string" || candidate.token.length === 0) return false;
  if (!candidate.user || typeof candidate.user !== "object") return false;
  return typeof candidate.user.id === "number" && typeof candidate.user.name === "string";
}

export function getSession(): StoredSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }

  // A malformed/partial record (bad shape, corrupted write, older schema
  // version) must read as "no session" rather than propagate an invalid
  // token that would fail confusingly on the next authenticated request.
  if (!isValidSession(parsed)) {
    clearSession();
    return null;
  }

  return parsed;
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  // Every logout/session-expiry path funnels through here — the one choke
  // point that guarantees a next login (possibly a different account) never
  // inherits the previous user's cached favorite ids.
  clearFavoritesCache();
}
