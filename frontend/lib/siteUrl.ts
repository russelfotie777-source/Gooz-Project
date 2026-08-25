// Single source of truth for the site's public origin — used to build
// absolute URLs (canonical, hreflang, sitemap, JSON-LD, OG). Must be set to
// the real production domain via NEXT_PUBLIC_SITE_URL once deployed; the
// localhost fallback only matters for local dev/testing.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
