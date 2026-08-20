// Shared between CartItems (where a coupon can first be applied) and
// CheckoutContext (which needs that same code to carry through into the
// order) — the cart and checkout flows don't otherwise share any state, so
// without this a coupon applied on the cart page would silently vanish by
// the time the customer reaches checkout.
const COUPON_STORAGE_KEY = "shopitech-coupon-code";

export function readPersistedCouponCode(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(COUPON_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function persistCouponCode(code: string): void {
  try {
    window.sessionStorage.setItem(COUPON_STORAGE_KEY, code);
  } catch {
    // Best-effort only — worst case the code just doesn't carry over.
  }
}
