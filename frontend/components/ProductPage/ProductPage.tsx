import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ProductAdBanner from "@/components/ProductAdBanner/ProductAdBanner";
import ProductDetail from "@/components/ProductDetail/ProductDetail";
import ProductSection from "@/components/ProductSection/ProductSection";
import type { Banner, Product } from "@/lib/types";
import styles from "./ProductPage.module.css";

interface ProductPageProps {
  product: Product;
  recommendedProducts: Product[];
  /** Admin-managed (location "product"). Falls back to the static default
   *  banner below when the admin hasn't added any yet, so this spot is
   *  never empty. */
  adBanners: Banner[];
}

// Figma: desktop node 975:5613, mobile node 223:189.
export default function ProductPage({ product, recommendedProducts, adBanners }: ProductPageProps) {
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

        <ProductDetail product={product} />

        <ProductSection
          titleKey="recommendedTitle"
          products={recommendedProducts}
          cardLayout="column"
        />
      </main>

      <Footer />
    </div>
  );
}
