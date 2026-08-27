import { notFound } from "next/navigation";
import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import HeroSection from "@/components/HeroSection/HeroSection";
import ProductSection from "@/components/ProductSection/ProductSection";
import CategoryResults from "@/components/CategoryResults/CategoryResults";
import PromoBanner from "@/components/PromoBanner/PromoBanner";
import Footer from "@/components/Footer/Footer";
import { getBanners, getCategories, getProducts, getProductsPage } from "@/lib/api";
import styles from "./CategoryPage.module.css";

interface CategoryPageProps {
  categorySlug: string;
  /** From the ?page= search param (app/[lang]/categories/[slug]/page.tsx)
   *  — lets a crawler hitting ?page=2 directly get that page server-rendered
   *  instead of only ever seeing page 1 (see docs/seo-a-faire.md §4). */
  page: number;
}

// Figma: desktop node 975:3578, mobile node 117:84. Reuses the same header/
// hero/footer chrome as HomePage — only the CategoryResults section (price
// filter + sort + the category's own products) is new.
export default async function CategoryPage({ categorySlug, page }: CategoryPageProps) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const [categoryFirstPage, bestSellerProducts, otherProducts, banners] = await Promise.all([
    // CategoryResults manages further paging/filtering client-side after
    // this — see its own getProductsPage() calls — but starts from whatever
    // page the URL asked for, not always page 1.
    getProductsPage({ category_id: category.id, per_page: 9, page }),
    // "Best sellers" here is really just "first 4 of this category by
    // default sort" (no real popularity signal on this endpoint) — same as
    // before, just its own small fetch instead of slicing the (now paged)
    // categoryProducts array.
    getProducts({ category_id: category.id, per_page: 4 }),
    // Secondary/non-essential (recommended-products) fetch — a failure here
    // shouldn't take down a page whose main content already loaded fine.
    getProducts({ per_page: 8 }).catch(() => []),
    getBanners("category").catch(() => []),
  ]);

  const bestSellers = bestSellerProducts;
  const recommendedProducts = otherProducts
    .filter((p) => p.category?.id !== category.id)
    .slice(0, 4);

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <HeroSection categories={categories} banners={banners} />

        <ProductSection titleKey="bestSellersTitle" products={bestSellers} cardLayout="row" />

        <CategoryResults
          categoryName={category.name}
          initialProducts={categoryFirstPage.products}
          initialLastPage={categoryFirstPage.lastPage}
          initialTotal={categoryFirstPage.total}
          initialPage={page}
          categoryId={category.id}
        />

        <PromoBanner />

        <ProductSection
          titleKey="recommendedTitle"
          products={recommendedProducts}
          cardLayout="column"
        />
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
