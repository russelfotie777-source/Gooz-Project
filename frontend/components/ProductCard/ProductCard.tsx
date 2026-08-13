import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addCartItem } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import type { Product } from "@/lib/types";
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

function discountPercent(product: Product): number | null {
  if (!product.is_promotion || !product.promo_price || product.base_price <= 0) return null;
  const percent = Math.round((1 - product.promo_price / product.base_price) * 100);
  return percent > 0 ? percent : null;
}

export default function ProductCard({
  product,
  layout = "row",
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const [cartStatus, setCartStatus] = useState<"idle" | "adding" | "added">("idle");
  const primaryImage =
    product.images.find((img) => img.is_primary) ?? product.images[0];
  const discount = discountPercent(product);

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
      const cart = await addCartItem(session.token, product.id, 1);
      notifyCartUpdated(cart.items.length);
      setCartStatus("added");
      window.setTimeout(() => setCartStatus("idle"), 2000);
    } catch {
      setCartStatus("idle");
    }
  }

  return (
    <article className={`${styles.card} ${layout === "column" ? styles.column : styles.row}`}>
      <div className={styles.imageWrapper}>
        <Link href={`/products/${product.id}`} className={styles.imageLink}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryImage?.image_url ?? PLACEHOLDER_IMAGE}
            alt={product.name}
            className={styles.image}
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) return;
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
          />
        </Link>
        {discount && <span className={styles.discountTag}>-{discount}%</span>}
        <button
          type="button"
          className={styles.wishlistButton}
          aria-label="Ajouter aux favoris"
          onClick={() => onToggleWishlist?.(product)}
        >
          <HeartIcon />
        </button>
      </div>

      <div className={styles.info}>
        <Link href={`/products/${product.id}`} className={styles.infoLink}>
          <p className={styles.name}>{product.name}</p>
          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}
        </Link>
        <div className={styles.footer}>
          <span className={styles.priceGroup}>
            {discount && (
              <span className={styles.priceOriginal}>{formatPrice(product.base_price)}</span>
            )}
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </span>
          <button
            type="button"
            className={`${styles.cartButton} ${cartStatus === "added" ? styles.cartButtonAdded : ""}`}
            aria-label="Ajouter au panier"
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
          Produit ajouté au panier !
        </div>
      )}
    </article>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 18 18" width="14" height="14" fill="none">
      <path
        d="M9 15.6 2.6 9.3a4 4 0 0 1 5.7-5.6L9 4.4l.7-.7a4 4 0 0 1 5.7 5.6L9 15.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
