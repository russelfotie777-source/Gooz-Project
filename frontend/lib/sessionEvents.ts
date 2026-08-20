// Fired by authedFetch (lib/api.ts) on any 401 from an authenticated call —
// the one place that actually knows the token was rejected. Deliberately a
// plain DOM event with no import of lib/auth.ts: api.ts is kept free of any
// localStorage/session dependency (see its own comment), so the reaction
// (clearSession() + a visible notice) lives in whoever listens, not here.
const SESSION_EXPIRED_EVENT = "shopitech:session-expired";

export function notifySessionExpired(): void {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function onSessionExpired(handler: () => void): () => void {
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
}
