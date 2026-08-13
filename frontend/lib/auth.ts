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

export function getSession(): StoredSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
