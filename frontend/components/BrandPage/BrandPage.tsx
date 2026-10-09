import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import Footer from "@/components/Footer/Footer";
import CategoryResults from "@/components/CategoryResults/CategoryResults";
import type { Brand } from "@/lib/types";
import { getProductsPage } from "@/lib/api";
import styles from "./BrandPage.module.css";

interface BrandPageProps {
  brand: Brand;
  /** From the ?page= search param (app/[lang]/marques/[slug]/page.tsx) —
   *  same reasoning as CategoryPage/SearchPage (docs/seo-a-faire.md §4). */
  page: number;
}

// Reuses CategoryResults (price filter/sort/pagination) in "brand" mode,
// same as SearchPage does for search — no category-only hero/best-sellers
// sections, this page's whole purpose is "every product from this brand,
// nothing else".
export default async function BrandPage({ brand, page }: BrandPageProps) {
  const firstPage = await getProductsPage({ brand_id: brand.id, per_page: 9, page });

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <CategoryResults
          resultsTitle={brand.name}
          initialProducts={firstPage.products}
          initialLastPage={firstPage.lastPage}
          initialTotal={firstPage.total}
          initialPage={page}
          mode="brand"
          brandId={brand.id}
        />
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
