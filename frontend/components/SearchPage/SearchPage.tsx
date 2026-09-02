import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import Footer from "@/components/Footer/Footer";
import CategoryResults from "@/components/CategoryResults/CategoryResults";
import { getProductsPage } from "@/lib/api";
import styles from "./SearchPage.module.css";

interface SearchPageProps {
  query: string;
  /** From the ?page= search param (app/[lang]/recherche/page.tsx) — same
   *  reasoning as CategoryPage/HomePage (docs/seo-a-faire.md §4), though
   *  search results are noindex anyway; mainly for shareable links and
   *  working browser back/forward here. */
  page: number;
}

// Reached from the Header search bar (desktop + mobile), now that its form
// actually submits instead of doing nothing. Reuses CategoryResults (price
// filter/sort/pagination) in "search" mode instead of building a parallel
// results grid — same chrome as CategoryPage, just without the category-only
// hero/promo sections.
export default async function SearchPage({ query, page }: SearchPageProps) {
  const trimmed = query.trim();
  const firstPage = trimmed
    ? await getProductsPage({ q: trimmed, per_page: 9, page })
    : { products: [], lastPage: 1, total: 0, currentPage: 1 };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <CategoryResults
          categoryName={trimmed}
          initialProducts={firstPage.products}
          initialLastPage={firstPage.lastPage}
          initialTotal={firstPage.total}
          initialPage={page}
          mode="search"
          searchQuery={trimmed}
        />
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
