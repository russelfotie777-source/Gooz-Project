import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import CategoryList from "@/components/CategoryList/CategoryList";
import DynamicHomepageSection from "@/components/DynamicHomepageSection/DynamicHomepageSection";
import FlashSacrificeCard from "@/components/FlashSacrificeCard/FlashSacrificeCard";
import HeroSection from "@/components/HeroSection/HeroSection";
import MysteryBoxCard from "@/components/MysteryBoxCard/MysteryBoxCard";
import ProductSection from "@/components/ProductSection/ProductSection";
import CatalogueSection from "@/components/CatalogueSection/CatalogueSection";
import PromoBanner from "@/components/PromoBanner/PromoBanner";
import BrandsSection from "@/components/BrandsSection/BrandsSection";
import Footer from "@/components/Footer/Footer";
import {
  getBanners,
  getCategories,
  getBrands,
  getHomepageAdSettings,
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
  const [categories, brands, products, catalogueFirstPage, banners, adSettings, homepageSections] =
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
      // Admin-picked products for the two ad-column cards (see
      // Admin\HomepageAdSettingController) — not fatal either, falls back
      // to the automatic pick below.
      getHomepageAdSettings().catch(() => ({ flash_sacrifice_product: null, mystery_box_product: null })),
      // Same reasoning: admin-configured sections are additive to the
      // hand-built ones below, never required for the page to render.
      getHomepageSections().catch(() => []),
    ]);

  const saleProducts = products.filter((p) => p.variants.some((v) => v.is_promotion));
  const popularProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);
  // The hero's two side ad slots (see HeroSection's adSlotOneContent/
  // adSlotTwoContent) are dedicated features now, not admin-managed banner
  // carousels (location homepage_ad_1/2 — see AdBannerCarousel) — a flash
  // countdown and a mystery-box promo. Both feature a real product the
  // admin picked (see the "Bannières pub accueil" screen); with no pick
  // yet, the flash-sacrifice slot falls back to an on-sale product (or any
  // product) so it's never empty, while the mystery box just stays generic.
  const flashProduct = adSettings.flash_sacrifice_product ?? saleProducts[0] ?? products[0] ?? null;
  const mysteryBoxProduct = adSettings.mystery_box_product;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <CategoryList categories={categories} />

        <HeroSection
          categories={categories}
          banners={banners}
          adSlotOneContent={flashProduct ? <FlashSacrificeCard product={flashProduct} /> : undefined}
          adSlotTwoContent={<MysteryBoxCard product={mysteryBoxProduct} />}
        />

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
