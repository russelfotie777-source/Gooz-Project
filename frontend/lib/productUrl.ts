// `/products/{id}-{slug}` — the id stays load-bearing (see
// app/[lang]/products/[id]/page.tsx, which parses it back out), the slug is
// purely for readability/keyword relevance in the URL. Centralized here so
// every link (ProductCard, HeroBanner, sitemap.ts, canonical URLs...) builds
// the exact same shape and stays in sync if that shape ever changes.
export function productPath(product: { id: number; slug?: string }): string {
  return product.slug ? `/products/${product.id}-${product.slug}` : `/products/${product.id}`;
}
