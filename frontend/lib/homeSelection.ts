import type { Category, Product } from "./types";
import { getDisplayVariant } from "./pricing";

// Selection rules behind the homepage's automatic rows (see HomePage.tsx).
// Kept as plain functions so they're unit-testable without rendering.

// Cameroon is UTC+1 all year (no DST) — a fixed offset is exact here.
const DOUALA_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Discount of the product's displayed (cheapest) variant, in whole percent. */
export function discountPercent(product: Product): number {
  const variant = getDisplayVariant(product);
  if (!variant || !variant.is_promotion || variant.base_price <= 0) return 0;
  return Math.max(0, Math.round(((variant.base_price - variant.price) / variant.base_price) * 100));
}

/** Days since epoch on Douala's calendar — changes at local midnight. */
export function dealDayIndex(now: number = Date.now()): number {
  return Math.floor((now + DOUALA_OFFSET_MS) / DAY_MS);
}

/** Milliseconds left until the next Douala midnight (when the deal pick rotates). */
export function msUntilDealReset(now: number = Date.now()): number {
  const local = now + DOUALA_OFFSET_MS;
  return DAY_MS - (local % DAY_MS);
}

/**
 * "Méga offres du jour": the biggest discounts first, rotated once a day so
 * the countdown shown next to the row is truthful — at midnight the
 * selection really changes. Only the top `poolSize` discounts take part in
 * the rotation, so small discounts never crowd out big ones.
 */
export function pickDailyDeals(products: Product[], dayIndex: number, size = 12, poolSize = 24): Product[] {
  const pool = products
    .map((product) => ({ product, off: discountPercent(product) }))
    .filter((entry) => entry.off > 0)
    .sort((a, b) => b.off - a.off)
    .slice(0, poolSize)
    .map((entry) => entry.product);

  if (pool.length <= size) return pool;

  const start = (dayIndex * Math.ceil(size / 2)) % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  // Re-sort the day's pick by discount so the strongest deal still leads.
  return rotated.slice(0, size).sort((a, b) => discountPercent(b) - discountPercent(a));
}

/**
 * Categories big enough to deserve their own homepage row: the `count`
 * largest by active product count, ignoring any below `minProducts` (a row
 * of 2 products looks broken next to full carousels).
 */
export function pickShowcaseCategories(categories: Category[], count = 3, minProducts = 6): Category[] {
  return categories
    .filter((category) => (category.products_count ?? 0) >= minProducts)
    .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
    .slice(0, count);
}

/** Categories ordered by size, biggest first — for the category grid. */
export function sortCategoriesBySize(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0));
}

/** True when both lists hold the same products in the same order. */
export function sameProducts(a: Product[], b: Product[]): boolean {
  return a.length === b.length && a.every((product, i) => product.id === b[i].id);
}

/**
 * "Recommandé pour vous": the categories that appear most among the
 * products the shopper recently viewed, most frequent first.
 */
export function topCategoryIds(viewed: Product[], count = 2): number[] {
  const tally = new Map<number, number>();
  for (const product of viewed) {
    for (const category of product.categories ?? []) {
      tally.set(category.id, (tally.get(category.id) ?? 0) + 1);
    }
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([id]) => id);
}
