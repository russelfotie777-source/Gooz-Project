// Single source of truth for the site's public origin — used to build
// absolute URLs (canonical, hreflang, sitemap, JSON-LD, OG, the WhatsApp
// order message's product link). Must be set to the real production domain
// via NEXT_PUBLIC_SITE_URL once deployed; the localhost fallback only
// matters for local dev/testing. NEXT_PUBLIC_* is inlined at build time, not
// read at container start, so this has to be set wherever `next build` runs
// (see Dockerfile/docker-compose.yml) — this check only catches a missing
// one at module-load time, not before the build itself ships without it.
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "[siteUrl] NEXT_PUBLIC_SITE_URL is not set in production — absolute links (WhatsApp order message, sitemap, ...) will point to http://localhost:3000."
  );
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
