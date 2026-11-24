import type { Product, ProductVariant } from "./types";

/** The variant that sets a product's price_from — the cheapest effective
 * price among its variants. Used to keep price/discount display and the
 * variant sent to the cart in sync, since pricing lives on variants now. */
export function getDisplayVariant(product: Product): ProductVariant | null {
  if (product.variants.length === 0) return null;
  return product.variants.reduce((cheapest, v) => (v.price < cheapest.price ? v : cheapest));
}

/** Number only, grouped fr-FR style ("12 500") — for layouts that print
 *  the currency separately. fr-FR groups with a narrow no-break space
 *  (U+202F), which the heading font renders almost invisibly ("12500");
 *  a regular no-break space keeps the groups readable. */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value).replace(/ /g, " ");
}

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}
