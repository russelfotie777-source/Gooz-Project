import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { addCartItem } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { loadFavoriteIds, onFavoritesUpdated, toggleFavorite } from "@/lib/favoritesStore";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { getDisplayVariant } from "@/lib/pricing";
import { productPath } from "@/lib/productUrl";
import type { Product, ProductVariant } from "@/lib/types";
import styles from "./ProductCard.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

interface ProductCardProps {
  product: Product;
  /** "row" = compact card used in horizontal carousels (En Solde, Populaire).
   *  "column" = larger tile used in grids (Catalogue, Bonnes affaires). */
  layout?: "row" | "column";
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
  const imageTrackRef = useRef<HTMLAnchorElement>(null);

  function handleImageScroll() {
    const el = imageTrackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveImageIndex(Math.round(el.scrollLeft / el.clientWidth));
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
        {/* Swipeable like noon.com's catalogue cards — native horizontal
            scroll-snap inside the same <a>, not a separate gesture handler:
            a touch drag scrolls (no click fires), a plain tap still
            navigates, so this needs no logic to tell the two apart. */}
        <LocaleLink
          href={productPath(product)}
          className={styles.imageLink}
          ref={imageTrackRef}
          onScroll={images.length > 1 ? handleImageScroll : undefined}
        >
          {(images.length > 0 ? images : [null]).map((img) => (
            <div className={styles.imageSlide} key={img?.id ?? "placeholder"}>
              <Image
                src={img && !failedImageIds.has(img.id) ? (img.thumbnail_url ?? img.image_url) : PLACEHOLDER_IMAGE}
                alt={(img?.alt_text || product.name) ?? ""}
                className={styles.image}
                fill
                sizes={layout === "row" ? "96px" : "(min-width: 1024px) 280px, 45vw"}
                onError={() => img && setFailedImageIds((prev) => new Set(prev).add(img.id))}
              />
            </div>
          ))}
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
