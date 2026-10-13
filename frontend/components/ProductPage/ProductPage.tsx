import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ProductAdBanner from "@/components/ProductAdBanner/ProductAdBanner";
import ProductDetail from "@/components/ProductDetail/ProductDetail";
import ProductSection from "@/components/ProductSection/ProductSection";
import RecentlyViewedSection from "@/components/RecentlyViewedSection/RecentlyViewedSection";
import type { Banner, Product, Review } from "@/lib/types";
import styles from "./ProductPage.module.css";

interface ProductPageProps {
  product: Product;
  /** Co-purchased-with-this-product first, same-category fallback filling
   *  out the rest — see ProductController::related(). */
  relatedProducts: Product[];
  /** Same anonymous-session correlation as relatedProducts, off views
   *  instead of orders — see ProductController::alsoViewed(). */
  alsoViewedProducts: Product[];
  /** Same brand as `product`, already excluding it and whatever showed up
   *  in `relatedProducts`/`alsoViewedProducts` — see the product page's own
   *  data fetching. */
  brandProducts: Product[];
  /** Admin-managed (location "product"). Falls back to the static default
   *  banner below when the admin hasn't added any yet, so this spot is
   *  never empty. */
  adBanners: Banner[];
  /** Already-approved reviews only (see ReviewController::index). */
  reviews: Review[];
}

// Figma: desktop node 975:5613, mobile node 223:189.
export default function ProductPage({
  product,
  relatedProducts,
  alsoViewedProducts,
  brandProducts,
  adBanners,
  reviews,
}: ProductPageProps) {
  return (
    <div className={styles.page}>
      <Header variant="detail" />

      <main className={styles.main}>
        <div className={styles.adBanner}>
          {adBanners.length > 0 ? (
            <ProductAdBanner banners={adBanners} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/product/ad-banner.jpg" alt="" className={styles.adBannerImage} />
          )}
        </div>

        <ProductDetail product={product} reviews={reviews} />

        {/* "après avis client" on purpose — ProductDetail renders the
            reviews section as the last thing inside it, so these two
            naturally land right below them. */}
        {relatedProducts.length > 0 && (
          <ProductSection titleKey="frequentlyBoughtTitle" products={relatedProducts} cardLayout="column" />
        )}

        {alsoViewedProducts.length > 0 && (
          <ProductSection titleKey="alsoViewedTitle" products={alsoViewedProducts} cardLayout="column" />
        )}

        {brandProducts.length > 0 && (
          <ProductSection titleKey="moreFromBrandTitle" products={brandProducts} cardLayout="column" />
        )}

        <RecentlyViewedSection excludeProductId={product.id} />
      </main>

      <Footer />
    </div>
  );
}
