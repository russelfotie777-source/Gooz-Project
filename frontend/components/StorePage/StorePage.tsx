"use client";

import { useEffect, useRef, useState } from "react";
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

// How many cards render up front (server AND first client paint) — the
// catalogue this page pulls from can run into the hundreds, and rendering
// every one of them (each a full ProductCard: swipeable image gallery,
// wishlist state, add-to-cart button...) in one pass is what was making the
// page slow to open. Revealing more as the shopper actually scrolls down to
// them keeps the first paint cheap regardless of how big the catalogue is.
const INITIAL_BATCH = 16;
const BATCH_SIZE = 16;

// Matches this component's own CSS breakpoints (see .module.css) — kept in
// sync by hand since the column *count* has to be known in JS (for
// distributeColumns below), not just expressed in CSS.
const COLUMN_BREAKPOINTS: [minWidth: number, columns: number][] = [
  [1024, 5],
  [640, 3],
  [0, 2],
];

function columnCountForWidth(width: number): number {
  for (const [minWidth, columns] of COLUMN_BREAKPOINTS) {
    if (width >= minWidth) return columns;
  }
  return 2;
}

// Real masonry (via CSS `columns: N`) fills one column completely before
// spilling into the next — on a long list that meant the first dozen-plus
// products all stacked in a single column with no stagger at all, and the
// interleaved, uneven-height look only showed up once the second column
// finally started. Splitting the list into N arrays by hand and laying each
// one out in its own flex column makes every product take its turn across
// columns from the very first row instead.
function distributeColumns<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => columns[index % columnCount].push(item));
  return columns;
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
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [columnCount, setColumnCount] = useState(2);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrdered(shuffled(products));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function updateColumnCount() {
      setColumnCount(columnCountForWidth(window.innerWidth));
    }
    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // Mobile-only (see .scrollTopButton) — the global ScrollToTopButton in
  // Footer is desktop-only everywhere else (BottomNav already sits in that
  // corner on mobile), but this page's masonry grid can run to hundreds of
  // products, long enough that jumping back to the top is worth the one
  // exception.
  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Grows visibleCount as the shopper nears the bottom of what's currently
  // rendered — no extra network request, just revealing more of the
  // already-fetched (and already-shuffled) list that was sitting unrendered.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + BATCH_SIZE, ordered.length));
        }
      },
      // Starts loading the next batch a bit before the sentinel actually
      // scrolls into view, so new cards are ready by the time the shopper
      // gets there instead of popping in right at the edge of the screen.
      { rootMargin: "800px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [ordered.length]);

  const visibleProducts = ordered.slice(0, visibleCount);
  const columns = distributeColumns(visibleProducts, columnCount);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>{dict.store.title}</h1>

        {ordered.length === 0 ? (
          <p className={styles.empty}>{dict.store.noResults}</p>
        ) : (
          <>
            <div className={styles.grid}>
              {columns.map((column, columnIndex) => (
                <div className={styles.column} key={columnIndex}>
                  {column.map((product) => (
                    <div className={styles.cardWrap} key={product.id}>
                      <ProductCard product={product} layout="column" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {visibleCount < ordered.length && <div ref={sentinelRef} aria-hidden="true" />}
          </>
        )}
      </main>

      <Footer />

      <button
        type="button"
        className={`${styles.scrollTopButton} ${showScrollTop ? styles.scrollTopButtonVisible : ""}`}
        onClick={scrollToTop}
        aria-label={dict.scrollTop.label}
        tabIndex={showScrollTop ? 0 : -1}
      >
        <svg viewBox="0 0 20 20" fill="none" className={styles.scrollTopIcon}>
          <path
            d="M10 15V5M5 9l5-5 5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <BottomNav active="store" />
    </div>
  );
}
