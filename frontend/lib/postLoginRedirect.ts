import { addCartItem, getCart } from "./api";
import { notifyCartUpdated } from "./cartEvents";
import { toggleFavorite } from "./favoritesStore";
import { clearGuestCart, getGuestCartLines } from "./guestCart";
import { takePendingCartIntent } from "./pendingCartIntent";

// Folds whatever a guest added to their local cart (lib/guestCart.ts) into
// their real server cart right after login/signup. Best-effort per line —
// stock/availability can have changed since it was added as a guest, and
// one failing line shouldn't lose every other one. Always ends by
// re-reading the real cart so the header/BottomNav badge (subscribed to
// cartEvents) switches from the guest count to the account's actual count
// even when there was nothing to merge.
async function mergeGuestCartIntoAccount(token: string): Promise<void> {
  const lines = getGuestCartLines();

  for (const line of lines) {
    try {
      await addCartItem(token, line.productId, line.quantity, line.variantId ?? undefined);
    } catch {
      // Dropped — see above.
    }
  }
  if (lines.length > 0) clearGuestCart();

  try {
    const cart = await getCart(token);
    notifyCartUpdated(cart.items.length);
  } catch {
    // Badge just stays on its last known count; the next real cart fetch
    // (cart page, header mount elsewhere) will correct it.
  }
}

// Called right after every successful login/signup (phone, email, Google,
// Facebook — both the desktop and mobile auth flows) in place of the old
// hardcoded `router.push("/compte")`. Merges the guest cart, replays
// whatever wishlist action the shopper was in the middle of when they got
// sent to sign in, and returns the path they should land on — /compte when
// there was no pending wishlist action, same as before.
export async function resolvePostLoginRedirect(token: string): Promise<string> {
  await mergeGuestCartIntoAccount(token);

  const intent = takePendingCartIntent();
  if (!intent) return "/compte";

  try {
    // A guest tapping the heart can only mean "favorite this" — there's
    // nothing to un-favorite yet, they were never able to favorite it
    // before signing in.
    await toggleFavorite(token, intent.productId, true);
    return intent.returnPath;
  } catch {
    // The replay itself failing (network hiccup, ...) is no reason to
    // strand the shopper on /compte — send them back to where they were so
    // they can just retry the button themselves.
    return intent.returnPath;
  }
}
