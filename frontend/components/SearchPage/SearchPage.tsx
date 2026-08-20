import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import Footer from "@/components/Footer/Footer";
import CategoryResults from "@/components/CategoryResults/CategoryResults";
import { getProducts, PRODUCT_FETCH_CAP } from "@/lib/api";
import styles from "./SearchPage.module.css";

interface SearchPageProps {
  query: string;
}

// Reached from the Header search bar (desktop + mobile), now that its form
// actually submits instead of doing nothing. Reuses CategoryResults (price
// filter/sort/pagination) in "search" mode instead of building a parallel
// results grid — same chrome as CategoryPage, just without the category-only
// hero/promo sections.
export default async function SearchPage({ query }: SearchPageProps) {
  const trimmed = query.trim();
  const products = trimmed ? await getProducts({ q: trimmed, per_page: PRODUCT_FETCH_CAP }) : [];
  const possiblyTruncated = products.length >= PRODUCT_FETCH_CAP;

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <CategoryResults
          categoryName={trimmed}
          products={products}
          mode="search"
          possiblyTruncated={possiblyTruncated}
        />
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
