import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

// Account/session pages: no unique public content, nothing worth indexing,
// and most 404/redirect for a logged-out crawler anyway. Listed per locale
// since routes are always /fr/... or /en/... (see lib/i18n/config).
const PRIVATE_PATHS = [
  "cart",
  "checkout",
  "compte",
  "commandes",
  "adresses",
  "paiements",
  "notifications",
  "connexion",
  "inscription",
];

const DISALLOW = ["fr", "en"].flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}/${path}`));

// Standard crawlers pick these up under the "*" rule already — the named
// entries below are just to make explicit (for anyone reading this file, or
// any bot that treats an explicit mention differently from silence) that AI
// crawlers/answer engines are deliberately welcome here, not blocked by a
// leftover boilerplate rule.
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Amazonbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_USER_AGENTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
