import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { addCartItem } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { loadFavoriteIds, onFavoritesUpdated, toggleFavorite } from "@/lib/favoritesStore";
import { addGuestCartItem } from "@/lib/guestCart";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { savePendingCartIntent } from "@/lib/pendingCartIntent";
import { formatAmount, formatPrice, getDisplayVariant } from "@/lib/pricing";
import { productPath } from "@/lib/productUrl";
import { useSlideshowConductor } from "@/lib/slideshowConductor";
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
  /** "market" = marketplace tile (homepage rows below "Populaires"):
   *  bordered card, floating "+" cart button over the photo, FCFA price
   *  line with the discount in green. */
  layout?: "row" | "column" | "market";
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

function discountPercent(variant: ProductVariant | null): number | null {
  if (!variant || !variant.is_promotion || !variant.promo_price || variant.base_price <= 0) return null;
  const percent = Math.round((1 - variant.promo_price / variant.base_price) * 100);
  return percent > 0 ? percent : null;
}

const NEW_PRODUCT_DAYS = 30;

function isRecent(createdAt: string): boolean {
  const created = Date.parse(createdAt);
  return Number.isFinite(created) && Date.now() - created < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
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
  const cardRef = useRef<HTMLElement>(null);
  // Only the card the shopper is actually looking at should auto-advance —
  // without this, every card in a horizontally-scrolling carousel (most of
  // them off-screen) cycled its images at once, which is both pointless
  // work and visually noisy if a slide-in animation ever reveals several at
  // the same time. 0.6 reliably picks out the one card scroll-snap has
  // settled on (260px wide, nearly the full width of a phone screen) while
  // a neighbor just peeking in at the edge stays below it.
  const [isActiveInViewport, setIsActiveInViewport] = useState(false);

  useEffect(() => {
    if (manuallySwipeable || images.length <= 1) return;
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setIsActiveInViewport(entry.isIntersecting), {
      threshold: 0.6,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [manuallySwipeable, images.length]);

  // Inside a carousel row (ProductSection/DynamicHomepageSection), the row's
  // SlideshowConductor hands out turns so only one card changes photo at a
  // time — instead of every visible card flipping in sync. A card only
  // takes part while it's in view and has several photos.
  const conductor = useSlideshowConductor();
  const conductorId = useId();
  const autoplays = !manuallySwipeable && images.length > 1;

  const imageCount = images.length;

  useEffect(() => {
    const node = cardRef.current;
    if (!conductor || !node) return;
    return conductor.register(conductorId, node, () =>
      setActiveImageIndex((i) => (i + 1) % Math.max(1, imageCount))
    );
  }, [conductor, conductorId, imageCount]);

  useEffect(() => {
    conductor?.setEligible(conductorId, autoplays && isActiveInViewport);
  }, [conductor, conductorId, autoplays, isActiveInViewport, imageCount]);

  // Fallback outside any conductor: the card cycles on its own while in view.
  useEffect(() => {
    if (conductor || !autoplays || !isActiveInViewport) return;
    const id = window.setInterval(() => {
      setActiveImageIndex((i) => (i + 1) % images.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [conductor, autoplays, images.length, isActiveInViewport]);

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
  // the real add-to-cart action — but the prop stays so a future caller can
  // still special-case it (e.g. a quick-view modal). A guest still gets a
  // real cart (lib/guestCart.ts), merged into their account on login.
  async function handleAddToCart() {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    const session = getSession();
    if (!session) {
      addGuestCartItem(product.id, displayVariant?.id, 1);
      setCartStatus("added");
      window.setTimeout(() => setCartStatus("idle"), 2000);
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

  // Shared by every layout — only the chrome around it differs.
  const gallery = (
    <>
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
          {/* Swipeable cards slide (the photo follows the finger); cards
              that change photo on their own cross-fade instead — softer
              than a slide when nobody asked for the motion. */}
          <div
            className={`${styles.imageTrack} ${!manuallySwipeable ? styles.imageTrackFade : ""}`}
            style={
              manuallySwipeable
                ? {
                    transform: `translateX(${dragOffsetPercent ?? -activeImageIndex * 100}%)`,
                    transition: dragOffsetPercent === null ? undefined : "none",
                  }
                : undefined
            }
          >
            {(images.length > 0 ? images : [null]).map((img, slideIndex) => (
              <div
                className={`${styles.imageSlide} ${slideIndex === activeImageIndex ? styles.imageSlideActive : ""}`}
                key={img?.id ?? "placeholder"}
              >
                <Image
                  src={img && !failedImageIds.has(img.id) ? (img.thumbnail_url ?? img.image_url) : PLACEHOLDER_IMAGE}
                  alt={(img?.alt_text || product.name) ?? ""}
                  className={styles.image}
                  fill
                  sizes={
                    layout === "row"
                      ? "96px"
                      : layout === "market"
                        ? "(min-width: 1024px) 240px, 46vw"
                        : "(min-width: 1024px) 280px, 45vw"
                  }
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
    </>
  );

  const wishlistButton = (
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
  );

  const addedToast =
    cartStatus === "added" ? (
      <div className={styles.toast} role="status" aria-live="polite">
        <img src="/icon/product-detail/check-circle.svg" alt="" className={styles.toastIcon} />
        {dict.common.addedToCart}
      </div>
    ) : null;

  if (layout === "market") {
    const isNew = isRecent(product.created_at);
    return (
      <article ref={cardRef} className={`${styles.card} ${styles.market}`}>
        <div className={styles.imageWrapper}>
          {gallery}
          {isNew && <span className={styles.marketTag}>{dict.common.newBadge}</span>}
          {wishlistButton}
          <button
            type="button"
            className={`${styles.marketAdd} ${cartStatus === "added" ? styles.marketAddDone : ""}`}
            aria-label={dict.common.addToCart}
            disabled={cartStatus === "adding"}
            onClick={handleAddToCart}
          >
            {cartStatus === "added" ? <CheckIcon /> : <PlusIcon />}
          </button>
        </div>

        <LocaleLink href={productPath(product)} className={styles.marketBody}>
          <h3 className={styles.marketName}>{product.name}</h3>
          {product.price_from !== null ? (
            <span className={styles.marketPrice}>
              <strong className={styles.marketAmount}>
                {formatAmount(product.price_from)}
                <span className={styles.marketCurrency}> FCFA</span>
              </strong>
              {discount && displayVariant && (
                <>
                  <s className={styles.marketOld}>{formatAmount(displayVariant.base_price)} FCFA</s>
                  <em className={styles.marketOff}>-{discount}%</em>
                </>
              )}
            </span>
          ) : (
            <span className={styles.marketUnavailable}>{dict.common.priceUnavailable}</span>
          )}
          {product.brand?.name && <span className={styles.marketChip}>{product.brand.name}</span>}
          <span className={styles.marketExpress}>
            <BoltIcon />
            {dict.common.expressLabel}
            <small className={styles.marketExpressNote}>
              <span className={styles.marketExpressPrefix}>{dict.common.expressDelayPrefix} </span>
              {dict.common.expressDelay}
            </small>
          </span>
        </LocaleLink>

        {addedToast}
      </article>
    );
  }

  return (
    <article ref={cardRef} className={`${styles.card} ${layout === "column" ? styles.column : styles.row}`}>
      <div className={styles.imageWrapper}>
        {gallery}
        {discount && <span className={styles.discountTag}>-{discount}%</span>}
        {wishlistButton}
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

      {addedToast}
    </article>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
