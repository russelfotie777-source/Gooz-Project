// Registers the single shared service worker (public/sw.js — handles both
// offline caching and Firebase Cloud Messaging background push, see that
// file's own comment for why they're merged). Both ServiceWorkerRegistrar
// (unconditional, for offline) and lib/firebase/messaging.ts (gated behind
// notification permission) call this same function — registering the same
// script/scope twice is a harmless no-op, the browser just returns the
// existing registration.
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    // sw.js is a static file — it's never bundled by Next, so it can't read
    // process.env itself. The env is passed as a query param instead, so
    // sw.js can skip its offline-caching fetch handler outside production:
    // that handler intercepts every same-origin request, including
    // Turbopack's own HMR/RSC navigation fetches, which don't survive being
    // replayed through fetch() inside the worker — this caused "Failed to
    // fetch" errors on plain page navigation during local dev. Push
    // notifications are a separate `push` event handler in sw.js, unaffected
    // either way, so this doesn't block testing push locally.
    return await navigator.serviceWorker.register(`/sw.js?env=${process.env.NODE_ENV}`);
  } catch (error) {
    console.error("Service worker registration failed", error);
    return null;
  }
}
