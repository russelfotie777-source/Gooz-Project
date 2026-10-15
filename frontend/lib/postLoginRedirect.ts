import { addCartItem } from "./api";
import { notifyCartUpdated } from "./cartEvents";
import { toggleFavorite } from "./favoritesStore";
import { takePendingCartIntent } from "./pendingCartIntent";

// Called right after every successful login/signup (phone, email, Google,
// Facebook — both the desktop and mobile auth flows) in place of the old
// hardcoded `router.push("/compte")`. Replays whatever cart/favorite action
// the shopper was in the middle of when they got sent to sign in, and
// returns the path they should land on — /compte when there was nothing
// pending, same as before.
export async function resolvePostLoginRedirect(token: string): Promise<string> {
  const intent = takePendingCartIntent();
  if (!intent) return "/compte";

  try {
    if (intent.type === "add-to-cart") {
      const cart = await addCartItem(token, intent.productId, intent.quantity ?? 1, intent.variantId);
      notifyCartUpdated(cart.items.length);
      return intent.goToCart ? "/cart" : intent.returnPath;
    }

    // A guest tapping the heart can only mean "favorite this" — there's
    // nothing to un-favorite yet, they were never able to favorite it
    // before signing in.
    await toggleFavorite(token, intent.productId, true);
    return intent.returnPath;
  } catch {
    // The replay itself failing (stock changed, network hiccup, ...) is no
    // reason to strand the shopper on /compte — send them back to where
    // they were so they can just retry the button themselves.
    return intent.returnPath;
  }
}
