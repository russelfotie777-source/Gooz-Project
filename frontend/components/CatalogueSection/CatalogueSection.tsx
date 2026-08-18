"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./CatalogueSection.module.css";

interface CatalogueSectionProps {
  products: Product[];
  categories: Category[];
}

const PAGE_SIZE = 8;

const PRICE_RANGE_DEFS = [
  { id: "under-10000", key: "under10000", min: 0, max: 9999 },
  { id: "10000-25000", key: "10000to25000", min: 10000, max: 25000 },
  { id: "25000-50000", key: "25000to50000", min: 25000, max: 50000 },
  { id: "over-50000", key: "over50000", min: 50001, max: Infinity },
] as const;

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function CatalogueSection({ products, categories }: CatalogueSectionProps) {
  const dict = useDictionary();
  const PRICE_RANGES = PRICE_RANGE_DEFS.map((r) => ({
    ...r,
    label: dict.home.catalogue.priceRanges[r.key],
  }));
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [priceRangeId, setPriceRangeId] = useState<string | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<number>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const brands = useMemo(() => {
    const byId = new Map<number, string>();
    for (const product of products) {
      if (product.brand) byId.set(product.brand.id, product.brand.name);
    }
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  const colors = useMemo(() => {
    const set = new Set<string>();
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.color) set.add(variant.color);
      }
    }
    return Array.from(set).sort();
  }, [products]);

  const priceRange = PRICE_RANGES.find((r) => r.id === priceRangeId);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        if (activeCategoryId && product.category?.id !== activeCategoryId) return false;
        const price = product.price_from ?? 0;
        if (priceRange && (price < priceRange.min || price > priceRange.max)) {
          return false;
        }
        if (selectedBrandIds.size > 0 && (!product.brand || !selectedBrandIds.has(product.brand.id))) {
          return false;
        }
        if (
          selectedColors.size > 0 &&
          !product.variants.some((v) => v.color && selectedColors.has(v.color))
        ) {
          return false;
        }
        return true;
      }),
    [products, activeCategoryId, priceRange, selectedBrandIds, selectedColors]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function toggleGroup(name: string) {
    setOpenGroup((current) => (current === name ? null : name));
  }

  function selectCategory(id: number | null) {
    setActiveCategoryId(id);
    setPage(1);
  }

  function selectPriceRange(id: string) {
    setPriceRangeId((current) => (current === id ? null : id));
    setPage(1);
  }

  function toggleBrand(id: number) {
    setSelectedBrandIds((current) => toggleInSet(current, id));
    setPage(1);
  }

  function toggleColor(color: string) {
    setSelectedColors((current) => toggleInSet(current, color));
    setPage(1);
  }

  return (
    <section className={styles.section}>
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

        {pageItems.length > 0 ? (
          <div className={styles.grid}>
            {pageItems.map((product) => (
              <ProductCard key={product.id} product={product} layout="column" />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>{dict.home.catalogue.noResults}</p>
        )}
      </div>

      {pageCount > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageArrow}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label={dict.home.catalogue.previousPage}
          >
            ‹
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.pageNumber} ${n === currentPage ? styles.pageNumberActive : ""}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className={styles.pageArrow}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
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
