// A guest's cart lives here (localStorage) instead of the server — cart
// routes all require auth:sanctum (API.md §4) and carts.user_id is NOT
// NULL in the backend schema, so there is no anonymous server-side cart to
// use instead. This is what lets a shopper add products and browse their
// cart before ever creating an account; only the real /checkout endpoint
// still requires login (see CheckoutContext — untouched by this).
// mergeGuestCartIntoAccount (lib/postLoginRedirect.ts) folds these lines
// into the real server cart right after login/signup succeeds.
import { getProduct } from "@/lib/api";
import { notifyCartUpdated } from "@/lib/cartEvents";
import type { Cart, CartItemLine } from "@/lib/types";

const STORAGE_KEY = "shopitech-guest-cart";

export interface GuestCartLine {
  productId: number;
  variantId: number | null;
  quantity: number;
}

function readLines(): GuestCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuestCartLine[]) : [];
  } catch {
    return [];
  }
}

// Mirrors cartEvents' existing contract: the header/BottomNav badge counts
// distinct lines, same as a real Cart's `items.length` (see useCartCount).
function writeLines(lines: GuestCartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage can throw (private browsing, quota) — worst case the guest
    // cart just doesn't survive a reload, no worse than before this existed.
  }
  notifyCartUpdated(lines.length);
}

export function getGuestCartLines(): GuestCartLine[] {
  return readLines();
}

export function getGuestCartLineCount(): number {
  return readLines().length;
}

export function addGuestCartItem(productId: number, variantId: number | undefined, quantity: number): void {
  const lines = readLines();
  const normalizedVariantId = variantId ?? null;
  const existing = lines.find((l) => l.productId === productId && l.variantId === normalizedVariantId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    lines.push({ productId, variantId: normalizedVariantId, quantity });
  }
  writeLines(lines);
}

export function updateGuestCartItemQuantity(productId: number, variantId: number | null, quantity: number): void {
  const lines = readLines();
  const existing = lines.find((l) => l.productId === productId && l.variantId === variantId);
  if (!existing) return;
  existing.quantity = quantity;
  writeLines(lines);
}

export function removeGuestCartItem(productId: number, variantId: number | null): void {
  writeLines(readLines().filter((l) => !(l.productId === productId && l.variantId === variantId)));
}

export function clearGuestCart(): void {
  writeLines([]);
}

// Turns the raw {productId, variantId, quantity} lines into the same shape
// a real server Cart returns (product/variant data, unit_price, line_total)
// by fetching each product from the public, cached /products/{id} endpoint
// — so CartItems can render a guest's cart with zero special-casing beyond
// `token` being null. ids are synthetic (negative, never sent to the
// server) — they only need to be stable React keys for one render.
export async function hydrateGuestCart(): Promise<Cart> {
  const lines = readLines();
  if (lines.length === 0) return { id: 0, items: [], total: 0 };

  const uniqueProductIds = Array.from(new Set(lines.map((l) => l.productId)));
  const products = await Promise.all(uniqueProductIds.map((id) => getProduct(id).catch(() => null)));
  const productsById = new Map(products.filter((p) => p !== null).map((p) => [p.id, p]));

  const items: CartItemLine[] = [];
  lines.forEach((line, index) => {
    // Deleted/deactivated since it was added as a guest — dropped silently,
    // same outcome a real cart would reach once checkout re-validates it.
    const product = productsById.get(line.productId);
    if (!product) return;

    const variant = line.variantId ? (product.variants.find((v) => v.id === line.variantId) ?? null) : null;
    const unitPrice = variant ? variant.price : (product.price_from ?? 0);

    items.push({
      id: -(index + 1),
      product,
      variant,
      quantity: line.quantity,
      unit_price: unitPrice,
      line_total: unitPrice * line.quantity,
    });
  });

  return { id: 0, items, total: items.reduce((sum, item) => sum + item.line_total, 0) };
}
