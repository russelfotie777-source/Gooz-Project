"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { getProductsPage, type GetProductsParams } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import Pagination from "@/components/Pagination/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./CategoryResults.module.css";

interface CategoryResultsProps {
  /** The display name shown as the page heading — the category's name, the
   * brand's name, or (in "search" mode) the raw query string, which is
   * wrapped in the translated "Results for ..." heading instead of shown
   * as-is. */
  resultsTitle: string;
  /** First page, fetched server-side so there's no loading flash on mount. */
  initialProducts: Product[];
  initialLastPage: number;
  initialTotal: number;
  /** From the ?page= search param — kept in sync with it (see goToPage) so
   *  page 2+ has a real, crawlable, shareable URL (docs/seo-a-faire.md §4).
   *  Sort/price filters deliberately stay client-only. */
  initialPage: number;
  /** "search" swaps the empty-state wording and the heading format ("no
   * product matches your search" / "Results for ..." instead of the plain
   * title) — same filter/sort/pagination UI in all three modes. */
  mode?: "category" | "brand" | "search";
  /** Required in "category" mode — re-fetches stay scoped to this category. */
  categoryId?: number;
  /** Required in "brand" mode — re-fetches stay scoped to this brand. */
  brandId?: number;
  /** Required in "search" mode — re-fetches stay scoped to this term. */
  searchQuery?: string;
}

const PAGE_SIZE = 9;

type SortOption = "" | "price-asc" | "price-desc" | "name-asc";

const SORT_TO_PARAMS: Record<Exclude<SortOption, "">, Pick<GetProductsParams, "sort_by" | "sort_dir">> = {
  "price-asc": { sort_by: "base_price", sort_dir: "asc" },
  "price-desc": { sort_by: "base_price", sort_dir: "desc" },
  "name-asc": { sort_by: "name", sort_dir: "asc" },
};

export default function CategoryResults({
  resultsTitle,
  initialProducts,
  initialLastPage,
  initialTotal,
  initialPage,
  mode = "category",
  categoryId,
  brandId,
  searchQuery,
}: CategoryResultsProps) {
  const dict = useDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmptySearch = mode === "search" && (searchQuery ?? "").trim() === "";
  const noResultsMessage = isEmptySearch
    ? dict.search.emptyPrompt
    : mode === "search"
      ? dict.search.noResults
      : dict.category.noResults;
  const heading =
    mode === "search" ? (isEmptySearch ? dict.header.search : dict.search.resultsFor(resultsTitle)) : resultsTitle;
  const SORT_LABELS: Record<Exclude<SortOption, "">, string> = {
    "price-asc": dict.category.sortPriceAsc,
    "price-desc": dict.category.sortPriceDesc,
    "name-asc": dict.category.sortNameAsc,
  };
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedRange, setAppliedRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
  const [sort, setSort] = useState<SortOption>("");
  const [page, setPageState] = useState(initialPage);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isEmptySearch) {
      setProducts([]);
      setLastPage(1);
      setTotal(0);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params: GetProductsParams = {
      page,
      per_page: PAGE_SIZE,
      category_id: mode === "category" ? categoryId : undefined,
      brand_id: mode === "brand" ? brandId : undefined,
      q: mode === "search" ? searchQuery : undefined,
      min_price: appliedRange.min ?? undefined,
      max_price: appliedRange.max ?? undefined,
      ...(sort ? SORT_TO_PARAMS[sort] : {}),
    };

    getProductsPage(params)
      .then((result) => {
        if (cancelled) return;
        setProducts(result.products);
        setLastPage(result.lastPage);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, appliedRange, categoryId, brandId, searchQuery, mode]);

  // Keeps ?page= in the address bar in sync with the current page — a
  // crawler (or a shared link) landing on this URL with ?page=2 gets that
  // page for real (see CategoryPage/SearchPage's own getProductsPage call),
  // and browser back/forward works. scroll:false so paging doesn't jump the
  // viewport back to the top of the document.
  function pageHref(n: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (n > 1) params.set("page", String(n));
    else params.delete("page");
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }

  function goToPage(n: number) {
    setPageState(n);
    router.push(pageHref(n), { scroll: false });
  }

  function applyPriceFilter() {
    setAppliedRange({
      min: minPrice.trim() ? Number(minPrice) : null,
      max: maxPrice.trim() ? Number(maxPrice) : null,
    });
    goToPage(1);
  }

  return (
    <section className={styles.section} id="catalogue">
      <div className={styles.resultBar}>
        <p className={styles.count}>{dict.category.resultsFound(total)}</p>
        <h1 className={styles.pageTitle}>{heading}</h1>

        <label className={styles.sort}>
          <span>{dict.category.sortBy}</span>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              goToPage(1);
            }}
          >
            <option value="">{dict.category.sortDefault}</option>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={styles.filterToggle}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          {dict.category.filters}
        </button>
      </div>

      <div className={styles.layout}>
        <aside className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`}>
          <p className={styles.filterTitle}>{dict.category.filters}</p>

          <div className={styles.priceRow}>
            <label className={styles.priceField}>
              <span>{dict.category.priceMin}</span>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={styles.priceInput}
              />
            </label>
            <label className={styles.priceField}>
              <span>{dict.category.priceMax}</span>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={styles.priceInput}
              />
            </label>
          </div>

          <button type="button" className={styles.filterButton} onClick={applyPriceFilter}>
            {dict.category.applyFilter}
          </button>
        </aside>

        {products.length > 0 ? (
          <div className={styles.grid} aria-busy={loading}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} layout="column" />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>{noResultsMessage}</p>
        )}
      </div>

      <Pagination page={page} lastPage={lastPage} loading={loading} pageHref={pageHref} onNavigate={goToPage} />
    </section>
  );
}
