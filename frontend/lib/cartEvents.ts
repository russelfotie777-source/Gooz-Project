// Lets any client component (ProductDetail's "add to cart", CartItems'
// quantity/remove actions) tell Header to refresh its cart badge without
// prop-drilling a shared cart store through every page. Fired after any
// successful cart mutation.
const CART_UPDATED_EVENT = "shopitech:cart-updated";

export function notifyCartUpdated(itemCount: number): void {
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { itemCount } }));
}

export function onCartUpdated(handler: (itemCount: number) => void): () => void {
  function listener(e: Event) {
    handler((e as CustomEvent<{ itemCount: number }>).detail.itemCount);
  }
  window.addEventListener(CART_UPDATED_EVENT, listener);
  return () => window.removeEventListener(CART_UPDATED_EVENT, listener);
}
