import type { GetProductsParams } from "./api";

// Product collections behind the homepage's "Voir tout" links, served by
// app/[lang]/collections/[slug]. Each entry is just a fixed set of
// /products query params (the shopper's own sort/price filters are layered
// on top by CategoryResults) plus its copy in the dictionary
// (dict.collections[key]). Adding a collection = one entry here + its
// title/description in fr.ts/en.ts.
//
// "pour-vous" is the odd one out: personalized from this browser's own
// browsing history, so it's computed client-side (PersonalCollection) and
// kept out of search engines.

export type CollectionKey =
  | "promotions"
  | "populaires"
  | "megaOffres"
  | "meilleuresVentes"
  | "nouveautes"
  | "petitsPrix"
  | "pourVous";

export interface CollectionDefinition {
  key: CollectionKey;
  /** URL segment: /collections/<slug>. */
  slug: string;
  /** Base query — fixed for this collection. Empty for "pour-vous". */
  params: GetProductsParams;
  /** Shows the daily-deals countdown in the page header. */
  countdown?: boolean;
  /** Client-side, history-based; not indexed. */
  personal?: boolean;
}

export const COLLECTIONS: CollectionDefinition[] = [
  { key: "promotions", slug: "promotions", params: { is_promotion: true, sort_by: "created_at", sort_dir: "desc" } },
  { key: "populaires", slug: "populaires", params: { sort_by: "most_viewed", sort_dir: "desc" } },
  {
    key: "megaOffres",
    slug: "mega-offres",
    params: { is_promotion: true, sort_by: "discount", sort_dir: "desc" },
    countdown: true,
  },
  { key: "meilleuresVentes", slug: "meilleures-ventes", params: { sort_by: "best_sellers", sort_dir: "desc" } },
  { key: "nouveautes", slug: "nouveautes", params: { sort_by: "created_at", sort_dir: "desc" } },
  { key: "petitsPrix", slug: "petits-prix", params: { sort_by: "base_price", sort_dir: "asc" } },
  { key: "pourVous", slug: "pour-vous", params: {}, personal: true },
];

export function findCollection(slug: string): CollectionDefinition | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

/** "/collections/<slug>" for a collection key — used by the homepage rows. */
export function collectionPath(key: CollectionKey): string {
  const collection = COLLECTIONS.find((c) => c.key === key);
  return `/collections/${collection?.slug ?? ""}`;
}
