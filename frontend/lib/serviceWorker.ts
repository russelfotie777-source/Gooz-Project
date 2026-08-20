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
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("Service worker registration failed", error);
    return null;
  }
}
