import type { NextConfig } from "next";

// Derived from the same env var lib/api.ts uses (NEXT_PUBLIC_API_URL) so
// next/image is allowed to optimize product/banner/category/brand photos
// served from the Laravel backend, wherever that ends up being deployed.
const apiOrigin = new URL(
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api/v1").replace(/\/api\/v1\/?$/, "")
);

const isDev = process.env.NODE_ENV !== "production";

// Once the backend's MEDIA_DISK is "s3" (see backend/.env.example), image_
// url/image/logo point at the bucket's own public URL (R2, S3, or any
// other S3-compatible host) instead of the backend's own /storage/** path
// — a completely different host next/image also needs to be told is safe
// to fetch from. Unset in dev by default (local disk doesn't need it);
// set NEXT_PUBLIC_MEDIA_URL to the same value as the backend's AWS_URL
// once that's live.
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL ? new URL(process.env.NEXT_PUBLIC_MEDIA_URL) : null;

// The Laravel backend bakes ITS OWN APP_URL into the absolute image_url/
// image/logo URLs it returns — in local dev that's always some loopback
// address (127.0.0.1:8001, or "localhost" with no port depending on
// backend/.env), completely independent of whatever NEXT_PUBLIC_API_URL is
// pointed at for the *browser's* sake (e.g. a devtunnels forward while
// testing on a phone). Both need to be in remotePatterns: the configured
// API origin (what lib/api.ts actually calls, and what prod really is), and
// — dev only — the backend's always-loopback real origin, since those two
// only happen to be the same value when nothing is being tunneled.
const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  {
    protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
    hostname: apiOrigin.hostname,
    port: apiOrigin.port,
    pathname: "/storage/**",
  },
];

if (isDev) {
  remotePatterns.push(
    { protocol: "http", hostname: "127.0.0.1", port: "8001", pathname: "/storage/**" },
    { protocol: "http", hostname: "localhost", pathname: "/storage/**" }
  );
}

if (mediaUrl) {
  remotePatterns.push({
    protocol: mediaUrl.protocol.replace(":", "") as "http" | "https",
    hostname: mediaUrl.hostname,
    port: mediaUrl.port,
    // Not /storage/** like the backend-served pattern above — the bucket
    // is flat (products/**, banners/**, categories/**, brands/**, ...) at
    // its root, there's no /storage prefix once files live there instead.
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    // Next 16's built-in SSRF guard refuses to fetch an optimized image
    // from any host resolving to a private/loopback IP regardless of
    // remotePatterns matching it — only relevant in dev (the backend is a
    // real public domain in prod).
    dangerouslyAllowLocalIP: isDev,
    remotePatterns,
  },
  // Smaller, self-contained output for a containerized deploy — no effect
  // on `next dev`/`next start`.
  output: "standalone",
  experimental: {
    // Lets BottomNav's <ViewTransition name="bottom-nav-..."> wrappers
    // actually animate — every tab is its own page (Home/Boutique/Panier/
    // Notifications/Compte each render their own BottomNav instance), so a
    // plain CSS transition never has an old and a new element to animate
    // between; the browser's View Transitions API is what lets React
    // morph the old page's raised circle into the new page's one even
    // though they're two different DOM nodes across a real navigation.
    // Without browser support (or if this ever needs disabling), pages
    // just transition instantly, same as before this was enabled.
    viewTransition: true,
  },
};

export default nextConfig;
