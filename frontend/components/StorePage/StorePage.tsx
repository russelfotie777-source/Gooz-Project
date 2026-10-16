"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import Footer from "@/components/Footer/Footer";
import ProductCard from "@/components/ProductCard/ProductCard";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import type { Product } from "@/lib/types";
import styles from "./StorePage.module.css";

interface StorePageProps {
  products: Product[];
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Reached from the mobile bottom nav's "store" slot — a browse-everything
// page, deliberately not another filterable/sortable grid like Catalogue/
// CategoryResults: every visit should feel like rummaging through the full
// shop in a different order, not a predictable list.
//
// Starts in the exact order the server sent (so hydration has nothing to
// mismatch) and is reshuffled right after mount. Math.random() only exists
// client-side, and even if it didn't, shuffling in the Server Component
// would still land every visitor on the SAME order for as long as that
// request stays cached (see page.tsx's own comment) — only a shuffle that
// runs in each visitor's own browser gives each of them their own order.
export default function StorePage({ products }: StorePageProps) {
  const dict = useDictionary();
  const [ordered, setOrdered] = useState(products);

  useEffect(() => {
    setOrdered(shuffled(products));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>{dict.store.title}</h1>

        {ordered.length === 0 ? (
          <p className={styles.empty}>{dict.store.noResults}</p>
        ) : (
          <div className={styles.grid}>
            {ordered.map((product) => (
              <div className={styles.cardWrap} key={product.id}>
                <ProductCard product={product} layout="column" />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <BottomNav active="store" />
    </div>
  );
}
