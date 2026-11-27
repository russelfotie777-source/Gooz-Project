import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import CategoryList from "@/components/CategoryList/CategoryList";
import CategoryGrid from "@/components/CategoryGrid/CategoryGrid";
import CategoryShowcase from "@/components/CategoryShowcase/CategoryShowcase";
import DealCountdown from "@/components/DealCountdown/DealCountdown";
import DynamicHomepageSection from "@/components/DynamicHomepageSection/DynamicHomepageSection";
import FlashSacrificeCard from "@/components/FlashSacrificeCard/FlashSacrificeCard";
import HeroSection from "@/components/HeroSection/HeroSection";
import { DealBanners, StripBanners, WideBanner } from "@/components/HomeBanners/HomeBanners";
import MysteryBoxCard from "@/components/MysteryBoxCard/MysteryBoxCard";
import ProductSection from "@/components/ProductSection/ProductSection";
import PromoBanner from "@/components/PromoBanner/PromoBanner";
import PromoCarousel from "@/components/PromoCarousel/PromoCarousel";
import RecommendedSection from "@/components/RecommendedSection/RecommendedSection";
import BrandsSection from "@/components/BrandsSection/BrandsSection";
import Footer from "@/components/Footer/Footer";
import {
  getBanners,
  getCategories,
  getBrands,
  getHomepageAdSettings,
  getHomepageSections,
  getProducts,
  PRODUCT_FETCH_CAP,
} from "@/lib/api";
import {
  dealDayIndex,
  pickDailyDeals,
  pickShowcaseCategories,
  sameProducts,
  sortCategoriesBySize,
} from "@/lib/homeSelection";
import { collectionPath } from "@/lib/collections";
import type { Product } from "@/lib/types";
import styles from "./HomePage.module.css";

const ROW_SIZE = 12;

// Secondary rows must never take the page down — an empty row just hides.
const orEmpty = (promise: Promise<Product[]>) => promise.catch(() => [] as Product[]);

export default async function HomePage() {
  const [
    categories,
    brands,
    products,
    banners,
    adSettings,
    homepageSections,
    promoProducts,
    bestSellers,
    newArrivals,
    lowPrices,
    mostViewed,
  ] = await Promise.all([
    getCategories(),
    getBrands(),
    // Feeds the hero ad cards + "En solde" / "Populaires" — unchanged.
    getProducts({ per_page: PRODUCT_FETCH_CAP }),
    // Not fatal if it fails — the hero falls back to its static slide.
    getBanners("homepage").catch(() => []),
    // Admin-picked products for the two hero ad cards; falls back below.
    getHomepageAdSettings().catch(() => ({ flash_sacrifice_product: null, mystery_box_product: null })),
    // Admin-configured sections, appended after the automatic rows.
    getHomepageSections().catch(() => []),
    // Pool for "Méga offres du jour" (ranked + rotated by pickDailyDeals).
    orEmpty(getProducts({ is_promotion: true, per_page: PRODUCT_FETCH_CAP })),
    orEmpty(getProducts({ sort_by: "best_sellers", sort_dir: "desc", per_page: ROW_SIZE })),
    orEmpty(getProducts({ sort_by: "created_at", sort_dir: "desc", per_page: ROW_SIZE })),
    orEmpty(getProducts({ sort_by: "base_price", sort_dir: "asc", per_page: ROW_SIZE })),
    orEmpty(getProducts({ sort_by: "most_viewed", sort_dir: "desc", per_page: 4 })),
  ]);

  // The catalogue's biggest categories get a dedicated row each.
  const showcaseCategories = pickShowcaseCategories(categories);
  const showcaseProducts = await Promise.all(
    showcaseCategories.map((category) => orEmpty(getProducts({ category_id: category.id, per_page: ROW_SIZE })))
  );
  const showcases = showcaseCategories
    .map((category, i) => ({ category, products: showcaseProducts[i] }))
    .filter((showcase) => showcase.products.length > 0);

  // "En solde": the newest products actually on sale, taken from the
  // dedicated is_promotion query. (Filtering `products` — the newest
  // products overall — only caught the few promos among the latest
  // additions, so the row showed ~1 item while 100+ were on sale.)
  const isOnSale = (p: Product) => p.variants.some((v) => v.is_promotion);
  const saleProducts = (promoProducts.length > 0 ? promoProducts : products)
    .filter(isOnSale)
    .slice(0, ROW_SIZE);
  // "Produits populaires": most viewed over the last 30 days (falls back
  // to the newest products if that list is empty or unavailable).
  const popularProducts = mostViewed.length > 0 ? mostViewed : products.slice(0, 4);
  // First visit / no browsing history yet: a broad slice of the catalogue
  // (RecommendedSection swaps in personal picks client-side when it can).
  const recommendedFallback = products.slice(4, 4 + ROW_SIZE);
  const dailyDeals = pickDailyDeals(promoProducts, dealDayIndex(), ROW_SIZE);
  // With no orders recorded yet, the best-sellers sort falls back to newest
  // first — identical to "Nouveautés", so it's hidden rather than repeated.
  const showBestSellers = bestSellers.length > 0 && !sameProducts(bestSellers, newArrivals);

  // The hero's two side ad slots — admin pick, else an on-sale product.
  const flashProduct = adSettings.flash_sacrifice_product ?? saleProducts[0] ?? products[0] ?? null;
  const mysteryBoxProduct = adSettings.mystery_box_product;

  const [showcaseA, showcaseB, showcaseC] = showcases;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* ── Unchanged: hero, mobile categories, "En solde", "Populaires" ── */}
        <HeroSection
          categories={categories}
          banners={banners}
          adSlotOneContent={flashProduct ? <FlashSacrificeCard product={flashProduct} /> : undefined}
          adSlotTwoContent={<MysteryBoxCard product={mysteryBoxProduct} />}
        />

        <CategoryList categories={categories} />

        <ProductSection
          titleKey="saleTitle"
          products={saleProducts}
          cardLayout="row"
          viewAllHref={collectionPath("promotions")}
        />

        <ProductSection
          titleKey="popularTitle"
          products={popularProducts}
          cardLayout="row"
          viewAllHref={collectionPath("populaires")}
        />

        {/* ── Marketplace layout (replaces the old paginated catalogue) ── */}
        <StripBanners />

        <CategoryGrid categories={sortCategoriesBySize(categories)} />

        <RecommendedSection fallback={recommendedFallback} viewAllHref={collectionPath("pourVous")} />

        <PromoCarousel />

        {dailyDeals.length > 0 && (
          <ProductSection
            id="mega-offres"
            titleKey="megaDealsTitle"
            viewAllHref={collectionPath("megaOffres")}
            products={dailyDeals}
            cardLayout="market"
            tone="highlight"
            headerExtra={<DealCountdown />}
          />
        )}

        <WideBanner />

        {showBestSellers && (
          <ProductSection
            titleKey="bestSellersTitle"
            products={bestSellers}
            cardLayout="market"
            viewAllHref={collectionPath("meilleuresVentes")}
          />
        )}

        {showcaseA && <CategoryShowcase index={0} {...showcaseA} />}

        <DealBanners />

        {newArrivals.length > 0 && (
          <ProductSection
            id="nouveautes"
            titleKey="newArrivalsTitle"
            products={newArrivals}
            cardLayout="market"
            viewAllHref={collectionPath("nouveautes")}
          />
        )}

        {showcaseB && <CategoryShowcase index={1} {...showcaseB} />}

        <BrandsSection brands={brands} viewAllHref="/marques" />

        {showcaseC && <CategoryShowcase index={2} {...showcaseC} />}

        <PromoBanner />

        {lowPrices.length > 0 && (
          <ProductSection
            titleKey="lowPricesTitle"
            products={lowPrices}
            cardLayout="market"
            viewAllHref={collectionPath("petitsPrix")}
          />
        )}

        {/* Admin-configured sections (Admin\HomepageSectionController) —
            appended after the automatic rows, never replacing any of them. */}
        {homepageSections.map((section) => (
          <DynamicHomepageSection key={section.id} section={section} />
        ))}
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
