"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Brand, Category, Product } from "@/lib/types";
import { getProductsPage, type GetProductsParams } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./CatalogueSection.module.css";

interface CatalogueSectionProps {
  /** First page, fetched server-side so there's no loading flash on mount. */
  initialProducts: Product[];
  initialLastPage: number;
  /** From the ?page= search param — kept in sync with it (see goToPage)
   *  so page 2+ has a real, crawlable, shareable URL instead of only
   *  existing as client-side state (docs/seo-a-faire.md §4). Filters
   *  deliberately stay client-only — indexing every filter combination
   *  would create near-duplicate pages that dilute crawl budget. */
  initialPage: number;
  categories: Category[];
  /** Full catalogue-wide list, not just brands present in the current page
   *  (unlike before — the filter used to only ever show brands it happened
   *  to have already downloaded). */
  brands: Brand[];
}

const PAGE_SIZE = 8;

const PRICE_RANGE_DEFS = [
  { id: "under-10000", key: "under10000", min: 0, max: 9999 },
  { id: "10000-25000", key: "10000to25000", min: 10000, max: 25000 },
  { id: "25000-50000", key: "25000to50000", min: 25000, max: 50000 },
  { id: "over-50000", key: "over50000", min: 50001, max: undefined },
] as const;

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function CatalogueSection({
  initialProducts,
  initialLastPage,
  initialPage,
  categories,
  brands,
}: CatalogueSectionProps) {
  const dict = useDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const PRICE_RANGES = PRICE_RANGE_DEFS.map((r) => ({
    ...r,
    label: dict.home.catalogue.priceRanges[r.key],
  }));
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [priceRangeId, setPriceRangeId] = useState<string | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<number>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [page, setPageState] = useState(initialPage);
  const [products, setProducts] = useState(initialProducts);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  const priceRange = PRICE_RANGES.find((r) => r.id === priceRangeId);

  // No "distinct colors across the catalogue" endpoint exists, so — same as
  // before this was server-paginated — the color facet can only reflect
  // what's on the currently-loaded page, not the whole catalogue.
  const colors = useMemo(() => {
    const set = new Set<string>();
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.color) set.add(variant.color);
      }
    }
    return Array.from(set).sort();
  }, [products]);

  useEffect(() => {
    // Skip the fetch on mount — initialProducts (server-rendered) already
    // has it, and firing an identical request would just be a wasted
    // round-trip.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params: GetProductsParams = {
      page,
      per_page: PAGE_SIZE,
      category_id: activeCategoryId ?? undefined,
      brand_id: selectedBrandIds.size > 0 ? Array.from(selectedBrandIds) : undefined,
      color: selectedColors.size > 0 ? Array.from(selectedColors) : undefined,
      min_price: priceRange && priceRange.min > 0 ? priceRange.min : undefined,
      max_price: priceRange?.max,
    };

    getProductsPage(params)
      .then((result) => {
        if (cancelled) return;
        setProducts(result.products);
        setLastPage(result.lastPage);
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
  }, [page, activeCategoryId, priceRangeId, selectedBrandIds, selectedColors]);

  // Keeps ?page= in the address bar in sync with the current page — a
  // crawler (or a shared link) landing on /?page=2 gets that page for real
  // (see HomePage/getProductsPage above), and browser back/forward works.
  // scroll:false because a page-2 link shouldn't jump the viewport back to
  // the top of the document, just refresh the grid in place.
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

  function toggleGroup(name: string) {
    setOpenGroup((current) => (current === name ? null : name));
  }

  function selectCategory(id: number | null) {
    setActiveCategoryId(id);
    goToPage(1);
  }

  function selectPriceRange(id: string) {
    setPriceRangeId((current) => (current === id ? null : id));
    goToPage(1);
  }

  function toggleBrand(id: number) {
    setSelectedBrandIds((current) => toggleInSet(current, id));
    goToPage(1);
  }

  function toggleColor(color: string) {
    setSelectedColors((current) => toggleInSet(current, color));
    goToPage(1);
  }

  return (
    <section className={styles.section} id="catalogue">
      <div className={styles.header}>
        <h2 className={styles.title}>{dict.home.catalogue.title}</h2>
        <button
          type="button"
          className={styles.filterToggle}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          {dict.home.catalogue.filters}
        </button>
      </div>

      <div className={styles.layout}>
        <aside className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`}>
          <FilterGroup
            label={dict.home.catalogue.category}
            open={openGroup === "category"}
            onToggle={() => toggleGroup("category")}
          >
            <ul className={styles.filterList}>
              <li>
                <button
                  type="button"
                  className={`${styles.filterItem} ${activeCategoryId === null ? styles.filterItemActive : ""}`}
                  onClick={() => selectCategory(null)}
                >
                  {dict.home.catalogue.allCategories}
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    className={`${styles.filterItem} ${activeCategoryId === category.id ? styles.filterItemActive : ""}`}
                    onClick={() => selectCategory(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </FilterGroup>

          <FilterGroup
            label={dict.home.catalogue.price}
            open={openGroup === "price"}
            onToggle={() => toggleGroup("price")}
          >
            <ul className={styles.filterList}>
              {PRICE_RANGES.map((range) => (
                <li key={range.id}>
                  <button
                    type="button"
                    aria-pressed={priceRangeId === range.id}
                    className={`${styles.filterItem} ${priceRangeId === range.id ? styles.filterItemActive : ""}`}
                    onClick={() => selectPriceRange(range.id)}
                  >
                    {range.label}
                  </button>
                </li>
              ))}
            </ul>
          </FilterGroup>

          {brands.length > 0 && (
            <FilterGroup
              label={dict.home.catalogue.brand}
              open={openGroup === "brand"}
              onToggle={() => toggleGroup("brand")}
            >
              <ul className={styles.filterList}>
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <button
                      type="button"
                      aria-pressed={selectedBrandIds.has(brand.id)}
                      className={`${styles.filterItem} ${selectedBrandIds.has(brand.id) ? styles.filterItemActive : ""}`}
                      onClick={() => toggleBrand(brand.id)}
                    >
                      {brand.name}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterGroup>
          )}

          {colors.length > 0 && (
            <FilterGroup
              label={dict.home.catalogue.color}
              open={openGroup === "color"}
              onToggle={() => toggleGroup("color")}
            >
              <ul className={styles.filterList}>
                {colors.map((color) => (
                  <li key={color}>
                    <button
                      type="button"
                      aria-pressed={selectedColors.has(color)}
                      className={`${styles.filterItem} ${selectedColors.has(color) ? styles.filterItemActive : ""}`}
                      onClick={() => toggleColor(color)}
                    >
                      {color}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterGroup>
          )}
        </aside>

        {products.length > 0 ? (
          <div className={styles.grid} aria-busy={loading}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} layout="column" />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>{dict.home.catalogue.noResults}</p>
        )}
      </div>

      {lastPage > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageArrow}
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
            aria-label={dict.home.catalogue.previousPage}
          >
            ‹
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((n) => (
            // A real <a href> (not a plain button) — this is what actually
            // lets a crawler discover page 2+ at all, by following a real
            // link instead of needing to run an onClick handler. Clicking it
            // still gets the fast client-side refetch via goToPage, same as
            // before; e.preventDefault() just stops Next's own Link
            // navigation from doing it a second time.
            <LocaleLink
              key={n}
              href={pageHref(n)}
              className={`${styles.pageNumber} ${n === page ? styles.pageNumberActive : ""}`}
              onClick={(e) => {
                e.preventDefault();
                goToPage(n);
              }}
              aria-current={n === page ? "page" : undefined}
            >
              {n}
            </LocaleLink>
          ))}
          <button
            type="button"
            className={styles.pageArrow}
            onClick={() => goToPage(Math.min(lastPage, page + 1))}
            disabled={page === lastPage || loading}
            aria-label={dict.home.catalogue.nextPage}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}

function FilterGroup({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.filterGroup}>
      <button
        type="button"
        className={`${styles.filterGroupHeader} ${open ? styles.filterGroupHeaderOpen : ""}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        {label}
        <ChevronIcon open={open} />
      </button>
      {open && <div className={styles.filterGroupBody}>{children}</div>}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      className={styles.chevron}
      style={{ transform: open ? "rotate(180deg)" : undefined }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
