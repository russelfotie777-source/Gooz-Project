import type { Product, ProductVariant } from "./types";

/** The variant that sets a product's price_from — the cheapest effective
 * price among its variants. Used to keep price/discount display and the
 * variant sent to the cart in sync, since pricing lives on variants now. */
export function getDisplayVariant(product: Product): ProductVariant | null {
  if (product.variants.length === 0) return null;
  return product.variants.reduce((cheapest, v) => (v.price < cheapest.price ? v : cheapest));
}
