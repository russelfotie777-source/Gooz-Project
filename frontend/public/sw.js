// Single service worker for the whole app. Used to be split into
// firebase-messaging-sw.js (push) + nothing (no offline support) — merged
// into one file because two service workers registered at the same scope
// ("/") don't coexist cleanly; only one ends up controlling fetches for a
// given scope. See lib/firebase/messaging.ts and lib/serviceWorker.ts,
// which both register this same file/registration instead of two.

importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js");

// Same public Web app config as lib/firebase/config.ts — duplicated because
// this file is served as-is from /public and never passes through Next.js's
// bundler, so it can't read that module or any process.env value.
firebase.initializeApp({
  apiKey: "AIzaSyCYmmBzE0Ao8pmRkA5MWrEMl9KjXf9WmmM",
  authDomain: "shopitechmessage.firebaseapp.com",
  projectId: "shopitechmessage",
  storageBucket: "shopitechmessage.firebasestorage.app",
  messagingSenderId: "590203958596",
  appId: "1:590203958596:web:0c369225620c9f1d0cd311",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "Shopitech";
  const options = {
    body: payload.notification?.body,
    icon: "/icon-shopitech/logoFichier 33ICON.png",
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});

// --- Offline caching ---
//
// Next's JS/CSS chunk filenames are content-hashed per build, so this
// static, un-bundled file can't precache them by name the way a build-time
// tool (Workbox, next-pwa) would. Instead: cache pages/assets
// opportunistically as they're fetched (network-first, cache as a
// fallback), so anything already visited stays available offline. Bump
// CACHE_NAME when changing this logic so old caches get cleaned up.

const CACHE_NAME = "shopitech-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [OFFLINE_URL, "/manifest.json", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // POST/PUT aren't cacheable (and Next's server actions/RSC calls are
  // POSTs), so only GET goes through the cache logic below.
  if (request.method !== "GET") return;

  // Never intercept the Laravel API (different origin) — cart/order/auth
  // responses must always be live when online, and a stale cached response
  // served while "offline-looking but actually fine" would be actively
  // misleading. Cross-origin requests just pass through untouched.
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match(OFFLINE_URL);
        return Response.error();
      })
  );
});
