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
  const primaryImage =
    product.images.find((img) => img.is_primary) ?? product.images[0];
  const discount = discountPercent(product);

  return (
    <article className={`${styles.card} ${layout === "column" ? styles.column : styles.row}`}>
      <div className={styles.imageWrapper}>
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
        <p className={styles.name}>{product.name}</p>
        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.priceGroup}>
            {discount && (
              <span className={styles.priceOriginal}>{formatPrice(product.base_price)}</span>
            )}
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </span>
          <button
            type="button"
            className={styles.cartButton}
            aria-label="Ajouter au panier"
            onClick={() => onAddToCart?.(product)}
          >
            <img src="/icon/product/add-to-cart.svg" alt="" className={styles.cartIcon} />
          </button>
        </div>
      </div>
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
