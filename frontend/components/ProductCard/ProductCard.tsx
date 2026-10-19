import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { addCartItem } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { loadFavoriteIds, onFavoritesUpdated, toggleFavorite } from "@/lib/favoritesStore";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { savePendingCartIntent } from "@/lib/pendingCartIntent";
import { getDisplayVariant } from "@/lib/pricing";
import { productPath } from "@/lib/productUrl";
import type { Product, ProductVariant } from "@/lib/types";
import styles from "./ProductCard.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

interface ProductCardProps {
  product: Product;
  /** "row" = compact card. "column" = larger tile. Purely a size/style
   *  choice — several sections (Produits recommandés, Souvent acheté
   *  aussi...) deliberately use "column"-sized cards inside a horizontally
   *  scrolling carousel for emphasis, so this says nothing about whether
   *  the card sits inside one — see `swipeable` for that. */
  layout?: "row" | "column";
  /** Whether a touch drag on the card's own photo is read as "swipe to the
   *  next photo". Defaults to true (catalogue/boutique grids, favorites —
   *  nothing else around the card wants that horizontal gesture). Any card
   *  rendered inside a horizontally-scrolling carousel (see ProductSection,
   *  DynamicHomepageSection) must pass false: otherwise a finger placed on
   *  that card's photo can never scroll the carousel past it, regardless of
   *  which `layout` the card itself happens to use. */
  swipeable?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

function discountPercent(variant: ProductVariant | null): number | null {
  if (!variant || !variant.is_promotion || !variant.promo_price || variant.base_price <= 0) return null;
  const percent = Math.round((1 - variant.promo_price / variant.base_price) * 100);
  return percent > 0 ? percent : null;
}

export default function ProductCard({
  product,
  layout = "row",
  swipeable = true,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const [cartStatus, setCartStatus] = useState<"idle" | "adding" | "added">("idle");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  // Synced from the shared favoritesStore cache (loaded once per session,
  // not once per card) so the heart reflects real state on mount — including
  // after a reload — and reacts instantly if the same product is
  // favorited/unfavorited from another card or the favorites page.
  useEffect(() => {
    const session = getSession();
    if (!session) return;

    let cancelled = false;
    loadFavoriteIds(session.token)
      .then((ids) => {
        if (!cancelled) setIsFavorite(ids.has(product.id));
      })
      .catch(() => {});

    const unsubscribe = onFavoritesUpdated((ids) => setIsFavorite(ids.has(product.id)));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [product.id]);
  const primaryImage =
    product.images.find((img) => img.is_primary) ?? product.images[0];
  // Primary image first (matches the old single-image behavior), the rest
  // of the gallery after it — swiping through them (noon.com-style, see
  // .imageLink below) starts on the same photo the card always showed.
  const images = primaryImage
    ? [primaryImage, ...product.images.filter((img) => img.id !== primaryImage.id)]
    : [];
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set());
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [dragOffsetPercent, setDragOffsetPercent] = useState<number | null>(null);
  // Mutable drag bookkeeping — deliberately refs, not state: pointermove
  // fires far too often to route every sample through a re-render (that's
  // also why the live drag offset above is only committed to state when it
  // actually changes the rendered position, not on every pixel).
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    committed: "horizontal" | "vertical" | null;
    containerWidth: number;
  } | null>(null);
  const suppressNextClick = useRef(false);

  // Swiping the gallery used to be plain native horizontal scroll-snap
  // (overflow-x: auto) — simplest possible implementation, since a browser
  // never fires `click` after a touch-drag-scroll, so tap-vs-swipe needed no
  // logic of its own. In practice, on real phones, a scroll-snap container
  // nested inside a vertically-scrolling page can still grab a mostly-
  // vertical drag that starts on it (a known cross-engine quirk — CSS
  // touch-action alone didn't reliably fix it here either). This instead
  // drives the slide position from JS via pointer events, matching the
  // pattern HeroBanner/ProductAdBanner already use successfully: touch-action
  // is pan-y (only vertical panning is ever native on this element), and
  // horizontal movement is read and applied by hand — so the browser is
  // never in a position to "decide" to claim a vertical drag in the first
  // place. preventDefault() is only called once a drag is confirmed
  // horizontal, so a real vertical drag is left completely untouched and
  // scrolls the page exactly as if this card weren't there.
  const HORIZONTAL_COMMIT_PX = 6;
  const SWIPE_THRESHOLD_PX = 40;

  // Cards nested inside a horizontally-scrolling carousel (En Solde,
  // Populaire, Produits recommandés...) pass swipeable={false} — if they
  // also read horizontal drags as "swipe this card's own images", a finger
  // placed on a card's photo can never scroll the carousel past it at all.
  // Multiple photos still get shown here, just as an automatic slideshow
  // instead of something the shopper can grab — see the effect below.
  const manuallySwipeable = swipeable;

  useEffect(() => {
    if (manuallySwipeable || images.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveImageIndex((i) => (i + 1) % images.length);
    }, 2500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manuallySwipeable, images.length]);

  function handlePointerDown(e: React.PointerEvent<HTMLAnchorElement>) {
    if (!manuallySwipeable) return;
    if (images.length <= 1 || e.pointerType === "mouse") return;
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      committed: null,
      containerWidth: e.currentTarget.clientWidth,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;

    if (drag.committed === null) {
      if (Math.abs(deltaX) < HORIZONTAL_COMMIT_PX && Math.abs(deltaY) < HORIZONTAL_COMMIT_PX) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        // A real vertical drag — hand off to the page's own scroll and stop
        // tracking this gesture entirely; nothing here was ever prevented,
        // so the browser's native scroll has been running unobstructed.
        dragState.current = null;
        return;
      }
      drag.committed = "horizontal";
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    e.preventDefault();
    const deltaPercent = (deltaX / drag.containerWidth) * 100;
    const maxOffset = -(images.length - 1) * 100;
    const offset = Math.min(0, Math.max(maxOffset, -(activeImageIndex * 100) + deltaPercent));
    setDragOffsetPercent(offset);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLAnchorElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragState.current = null;

    if (drag.committed !== "horizontal") return;

    const deltaX = e.clientX - drag.startX;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
      const next = activeImageIndex + (deltaX < 0 ? 1 : -1);
      setActiveImageIndex(Math.min(images.length - 1, Math.max(0, next)));
    }
    setDragOffsetPercent(null);
    // The click that normally follows a pointerup on an <a> would otherwise
    // still navigate even though the user just swiped — only a real tap
    // (committed stayed null) should do that.
    suppressNextClick.current = true;
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLAnchorElement>) {
    if (dragState.current?.pointerId !== e.pointerId) return;
    dragState.current = null;
    setDragOffsetPercent(null);
  }

  function handleImageLinkClick(e: React.MouseEvent) {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      e.preventDefault();
    }
  }

  const displayVariant = getDisplayVariant(product);
  const discount = discountPercent(displayVariant);

  // No `onAddToCart` override is used anywhere in the app today — this is
  // the real add-to-cart action (API.md §4 cart routes require auth, hence
  // the guest -> /connexion redirect) — but the prop stays so a future
  // caller can still special-case it (e.g. a quick-view modal).
  async function handleAddToCart() {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    const session = getSession();
    if (!session) {
      savePendingCartIntent({
        type: "add-to-cart",
        productId: product.id,
        variantId: displayVariant?.id,
        quantity: 1,
        returnPath: window.location.pathname,
      });
      router.push("/connexion");
      return;
    }

    setCartStatus("adding");
    try {
      const cart = await addCartItem(session.token, product.id, 1, displayVariant?.id);
      notifyCartUpdated(cart.items.length);
      setCartStatus("added");
      window.setTimeout(() => setCartStatus("idle"), 2000);
    } catch {
      setCartStatus("idle");
    }
  }

  async function handleToggleWishlist() {
    if (onToggleWishlist) {
      onToggleWishlist(product);
      return;
    }

    const session = getSession();
    if (!session) {
      savePendingCartIntent({
        type: "toggle-wishlist",
        productId: product.id,
        returnPath: window.location.pathname,
      });
      router.push("/connexion");
      return;
    }

    const next = !isFavorite;
    setIsFavorite(next);
    setFavoriteBusy(true);
    try {
      await toggleFavorite(session.token, product.id, next);
    } catch {
      setIsFavorite(!next);
    } finally {
      setFavoriteBusy(false);
    }
  }

  return (
    <article className={`${styles.card} ${layout === "column" ? styles.column : styles.row}`}>
      <div className={styles.imageWrapper}>
        {/* Swipeable like noon.com's catalogue cards — see the pointer
            handlers above for why this is hand-rolled from pointer events
            rather than native horizontal scroll. */}
        <LocaleLink
          href={productPath(product)}
          className={`${styles.imageLink} ${!manuallySwipeable ? styles.imageLinkStatic : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleImageLinkClick}
        >
          <div
            className={styles.imageTrack}
            style={{
              transform: `translateX(${dragOffsetPercent ?? -activeImageIndex * 100}%)`,
              transition: dragOffsetPercent === null ? undefined : "none",
            }}
          >
            {(images.length > 0 ? images : [null]).map((img) => (
              <div className={styles.imageSlide} key={img?.id ?? "placeholder"}>
                <Image
                  src={img && !failedImageIds.has(img.id) ? (img.thumbnail_url ?? img.image_url) : PLACEHOLDER_IMAGE}
                  alt={(img?.alt_text || product.name) ?? ""}
                  className={styles.image}
                  fill
                  sizes={layout === "row" ? "96px" : "(min-width: 1024px) 280px, 45vw"}
                  draggable={false}
                  onError={() => img && setFailedImageIds((prev) => new Set(prev).add(img.id))}
                />
              </div>
            ))}
          </div>
        </LocaleLink>
        {images.length > 1 && (
          <div className={styles.dots} aria-hidden="true">
            {images.map((img, i) => (
              <span
                key={img.id}
                className={`${styles.dot} ${i === activeImageIndex ? styles.dotActive : ""}`}
              />
            ))}
          </div>
        )}
        {discount && <span className={styles.discountTag}>-{discount}%</span>}
        <button
          type="button"
          className={`${styles.wishlistButton} ${isFavorite ? styles.wishlistButtonActive : ""}`}
          aria-label={dict.common.addToWishlist}
          aria-pressed={isFavorite}
          disabled={favoriteBusy}
          onClick={handleToggleWishlist}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      </div>

      <div className={styles.info}>
        <LocaleLink href={productPath(product)} className={styles.infoLink}>
          <p className={styles.name}>{product.name}</p>
          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}
        </LocaleLink>
        <div className={styles.footer}>
          <span className={styles.priceGroup}>
            {discount && displayVariant && (
              <span className={styles.priceOriginal}>{formatPrice(displayVariant.base_price)}</span>
            )}
            <span className={styles.price}>
              {product.price_from !== null ? formatPrice(product.price_from) : dict.common.priceUnavailable}
            </span>
          </span>
          <button
            type="button"
            className={`${styles.cartButton} ${cartStatus === "added" ? styles.cartButtonAdded : ""}`}
            aria-label={dict.common.addToCart}
            disabled={cartStatus === "adding"}
            onClick={handleAddToCart}
          >
            <img src="/icon/product/add-to-cart.svg" alt="" className={styles.cartIcon} />
          </button>
        </div>
      </div>

      {cartStatus === "added" && (
        <div className={styles.toast} role="status" aria-live="polite">
          <img src="/icon/product-detail/check-circle.svg" alt="" className={styles.toastIcon} />
          {dict.common.addedToCart}
        </div>
      )}
    </article>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 18 18" width="14" height="14" fill={filled ? "currentColor" : "none"}>
      <path
        d="M9 15.6 2.6 9.3a4 4 0 0 1 5.7-5.6L9 4.4l.7-.7a4 4 0 0 1 5.7 5.6L9 15.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
