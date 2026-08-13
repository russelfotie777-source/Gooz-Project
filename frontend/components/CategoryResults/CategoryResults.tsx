"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./CategoryResults.module.css";

interface CategoryResultsProps {
  categoryName: string;
  products: Product[];
}

const PAGE_SIZE = 9;

type SortOption = "" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<Exclude<SortOption, "">, string> = {
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  "name-asc": "Nom (A-Z)",
};

export default function CategoryResults({ categoryName, products }: CategoryResultsProps) {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedRange, setAppliedRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
  const [sort, setSort] = useState<SortOption>("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const byPrice = products.filter((product) => {
      if (appliedRange.min !== null && product.price < appliedRange.min) return false;
      if (appliedRange.max !== null && product.price > appliedRange.max) return false;
      return true;
    });

    if (!sort) return byPrice;

    const sorted = [...byPrice];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, appliedRange, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function applyPriceFilter() {
    setAppliedRange({
      min: minPrice.trim() ? Number(minPrice) : null,
      max: maxPrice.trim() ? Number(maxPrice) : null,
    });
    setPage(1);
  }

  return (
    <section className={styles.section}>
      <div className={styles.resultBar}>
        <p className={styles.count}>{filtered.length} produits trouvés</p>
        <h1 className={styles.pageTitle}>{categoryName}</h1>

        <label className={styles.sort}>
          <span>Trier par :</span>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
          >
            <option value="">Défaut</option>
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
          Filtres
        </button>
      </div>

      <div className={styles.layout}>
        <aside className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`}>
          <p className={styles.filterTitle}>Filtres</p>

          <div className={styles.priceRow}>
            <label className={styles.priceField}>
              <span>Prix min</span>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={styles.priceInput}
              />
            </label>
            <label className={styles.priceField}>
              <span>Prix max</span>
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
            Filtrer
          </button>
        </aside>

        {pageItems.length > 0 ? (
          <div className={styles.grid}>
            {pageItems.map((product) => (
              <ProductCard key={product.id} product={product} layout="column" />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Aucun produit ne correspond à ces filtres.</p>
        )}
      </div>

      {pageCount > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageArrow}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Page précédente"
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
            aria-label="Page suivante"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
