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

interface HomePageProps {
  /** From the ?page= search param (app/[lang]/page.tsx) — lets a crawler
   *  hitting /?page=2 directly get that page's products server-rendered,
   *  instead of only ever seeing page 1 (see docs/seo-a-faire.md §4). */
  page: number;
}

export default async function HomePage({ page }: HomePageProps) {
  const [categories, brands, products, catalogueFirstPage, banners, adSlotOne, adSlotTwo, homepageSections] =
    await Promise.all([
      getCategories(),
      getBrands(),
      // Feeds the curated carousels below (on sale / popular / recommended) —
      // not paginated UI, just "first N of a broad pool", so this doesn't
      // need CatalogueSection's own real pagination.
      getProducts({ per_page: PRODUCT_FETCH_CAP }),
      // CatalogueSection manages further paging client-side after this — see
      // its own getProductsPage() calls — but starts from whatever page the
      // URL asked for, not always page 1.
      getProductsPage({ per_page: 8, page }),
      // Not fatal if it fails — the hero falls back to its static slide (see
      // HeroBanner) rather than taking the whole homepage down over a
      // secondary, non-essential fetch.
      getBanners("homepage").catch(() => []),
      // The two side ad slots next to the hero carousel — same "never fatal"
      // reasoning, and an empty list here just means that slot renders
      // nothing (see AdBannerCarousel).
      getBanners("homepage_ad_1").catch(() => []),
      getBanners("homepage_ad_2").catch(() => []),
      // Same reasoning: admin-configured sections are additive to the
      // hand-built ones below, never required for the page to render.
      getHomepageSections().catch(() => []),
    ]);

  const saleProducts = products.filter((p) => p.variants.some((v) => v.is_promotion));
  const popularProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <CategoryList categories={categories} />

        <HeroSection categories={categories} banners={banners} adSlotOne={adSlotOne} adSlotTwo={adSlotTwo} />

        <ProductSection titleKey="saleTitle" products={saleProducts} cardLayout="row" />

        <ProductSection titleKey="popularTitle" products={popularProducts} cardLayout="row" />

        <CatalogueSection
          initialProducts={catalogueFirstPage.products}
          initialLastPage={catalogueFirstPage.lastPage}
          initialPage={page}
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
