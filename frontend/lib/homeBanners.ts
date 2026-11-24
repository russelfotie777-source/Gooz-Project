import { staticAssetUrl } from "./api";

// Static homepage banners (below "Produits populaires"). Each entry pairs
// the image with where it leads, so swapping a creative is a one-line
// change here: swap the file at the same key in the R2 bucket's
// static/home/ prefix and update `src` (and `href`/`alt` if the message
// changed) — these raster images live on R2 rather than in public/images/
// to keep the app bundle and repo small (the wide banner stays local as
// it's an SVG, negligible in size).
//
// The files currently in the bucket are labelled placeholders at the exact
// size each slot expects — replace them with the real artwork.

export interface HomeBanner {
  src: string;
  /** Optional narrower creative for phones (<640px). */
  mobileSrc?: string;
  alt: string;
  href: string;
  width: number;
  height: number;
  mobileWidth?: number;
  mobileHeight?: number;
}

/** 3 side-by-side strips right after "Produits populaires" — 600×220 each. */
export const STRIP_BANNERS: HomeBanner[] = [
  {
    src: staticAssetUrl("home/strip-1.png"),
    alt: "Méga offres du jour",
    href: "#mega-offres",
    width: 600,
    height: 220,
  },
  {
    src: staticAssetUrl("home/strip-2.png"),
    alt: "Nouveautés",
    href: "#nouveautes",
    width: 600,
    height: 220,
  },
  {
    src: staticAssetUrl("home/strip-3.png"),
    alt: "Livraison rapide à Douala",
    href: "/frais-livraison",
    width: 600,
    height: 220,
  },
];

/** Full-width banner after "Méga offres" — 1600×220 desktop, 800×300 mobile. */
export const WIDE_BANNER: HomeBanner = {
  src: "/images/home/wide-1.svg",
  mobileSrc: "/images/home/wide-1-mobile.svg",
  alt: "Comment acheter sur Shopitech",
  href: "/comment-acheter",
  width: 1600,
  height: 220,
  mobileWidth: 800,
  mobileHeight: 300,
};

/** 2 banners side by side after "Meilleures ventes" — 900×300 each. */
export const DEAL_BANNERS: HomeBanner[] = [
  {
    src: staticAssetUrl("home/deal-1.png"),
    alt: "Découvrez toute la boutique",
    href: "/boutique",
    width: 900,
    height: 300,
  },
  {
    src: staticAssetUrl("home/deal-2.png"),
    alt: "Besoin d'aide ? Notre équipe vous répond",
    href: "/aide",
    width: 900,
    height: 300,
  },
];

/** Promo carousel between "Recommandé pour vous" and "Méga offres" —
 *  auto-advancing slides, 1200×400 each (3:1). Add or remove entries
 *  freely: dots and rotation follow the list length. */
export const PROMO_SLIDES: HomeBanner[] = [
  { src: staticAssetUrl("home/promo-1.png"), alt: "Méga soldes tech", href: "#mega-offres", width: 1200, height: 400 },
  { src: staticAssetUrl("home/promo-2.png"), alt: "Nouveautés de la semaine", href: "#nouveautes", width: 1200, height: 400 },
  { src: staticAssetUrl("home/promo-3.png"), alt: "Sécurisez votre maison", href: "/boutique", width: 1200, height: 400 },
  { src: staticAssetUrl("home/promo-4.png"), alt: "Réseau & WiFi pour pros", href: "/boutique", width: 1200, height: 400 },
  { src: staticAssetUrl("home/promo-5.png"), alt: "Livraison rapide à Douala", href: "/frais-livraison", width: 1200, height: 400 },
];

/** Fixed panel to the right of the carousel (desktop/tablet ≥ 900px) —
 *  meant for an animated GIF. Shown cropped to fill (object-fit: cover):
 *  a 600×660 creative fits the slot's shape best. */
export const PROMO_SIDE: HomeBanner = {
  src: staticAssetUrl("home/promo-side.gif"),
  alt: "Nouveau : montres connectées",
  href: "/boutique",
  width: 600,
  height: 660,
};
