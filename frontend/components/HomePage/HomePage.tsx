import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import CategoryList from "@/components/CategoryList/CategoryList";
import DynamicHomepageSection from "@/components/DynamicHomepageSection/DynamicHomepageSection";
import HeroSection from "@/components/HeroSection/HeroSection";
import ProductSection from "@/components/ProductSection/ProductSection";
import CatalogueSection from "@/components/CatalogueSection/CatalogueSection";
import PromoBanner from "@/components/PromoBanner/PromoBanner";
import BrandsSection from "@/components/BrandsSection/BrandsSection";
import Footer from "@/components/Footer/Footer";
import {
  getBanners,
  getCategories,
  getBrands,
  getHomepageSections,
  getProducts,
  getProductsPage,
  PRODUCT_FETCH_CAP,
} from "@/lib/api";
import styles from "./HomePage.module.css";

export default async function HomePage() {
  const [categories, brands, products, catalogueFirstPage, banners, homepageSections] = await Promise.all([
    getCategories(),
    getBrands(),
    // Feeds the curated carousels below (on sale / popular / recommended) —
    // not paginated UI, just "first N of a broad pool", so this doesn't
    // need CatalogueSection's own real pagination.
    getProducts({ per_page: PRODUCT_FETCH_CAP }),
    // CatalogueSection manages its own paging/filtering after this first
    // page — see its own getProductsPage() calls.
    getProductsPage({ per_page: 8 }),
    // Not fatal if it fails — the hero falls back to its static slide (see
    // HeroBanner) rather than taking the whole homepage down over a
    // secondary, non-essential fetch.
    getBanners("homepage").catch(() => []),
    // Same reasoning: admin-configured sections are additive to the
    // hand-built ones below, never required for the page to render.
    getHomepageSections().catch(() => []),
  ]);

  const saleProducts = products.filter((p) => p.variants.some((v) => v.is_promotion));
  const popularProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <CategoryList categories={categories} />

        <HeroSection categories={categories} banners={banners} />

        <ProductSection titleKey="saleTitle" products={saleProducts} cardLayout="row" />

        <ProductSection titleKey="popularTitle" products={popularProducts} cardLayout="row" />

        <CatalogueSection
          initialProducts={catalogueFirstPage.products}
          initialLastPage={catalogueFirstPage.lastPage}
          categories={categories}
          brands={brands}
        />

        <PromoBanner />

        <ProductSection
          titleKey="dealsTitle"
          products={saleProducts}
          cardLayout="column"
        />

        <BrandsSection brands={brands} />

        <ProductSection
          titleKey="recommendedTitle"
          products={recommendedProducts}
          cardLayout="column"
        />

        {/* Admin-configured sections (Admin\HomepageSectionController) —
            appended after the hand-built sections above, never replacing
            any of them. */}
        {homepageSections.map((section) => (
          <DynamicHomepageSection key={section.id} section={section} />
        ))}
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
