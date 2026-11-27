"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./CategoryGrid.module.css";

interface CategoryGridProps {
  /** Already ordered (biggest first — see sortCategoriesBySize). */
  categories: Category[];
}

/** Rows shown while collapsed (the last slot is the "Toutes" tile). */
const COLLAPSED_ROWS = 2;
/** Column count before the grid is measured (1440px desktop). */
const DEFAULT_COLUMNS = 10;

// Desktop-only round category tiles (phones already get CategoryList right
// under the hero, so showing both there would just repeat it). Collapsed to
// the biggest categories, with a last tile that reveals all of them — new
// categories (few products yet, so sorted last) stay reachable.
export default function CategoryGrid({ categories }: CategoryGridProps) {
  const dict = useDictionary();
  const [expanded, setExpanded] = useState(false);
  // The grid is auto-fill, so its column count depends on the width:
  // measured so the collapsed view always fills whole rows.
  const gridRef = useRef<HTMLElement>(null);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(() => {
      const count = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
      if (count > 0) setColumns(count);
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  if (categories.length === 0) return null;

  const COLLAPSED_COUNT = columns * COLLAPSED_ROWS - 1;

  const collapsible = categories.length > COLLAPSED_COUNT + 1;
  const visible = collapsible && !expanded ? categories.slice(0, COLLAPSED_COUNT) : categories;

  return (
    <nav ref={gridRef} className={styles.grid} aria-label={dict.home.categoriesNav}>
      {visible.map((category, index) => (
        <LocaleLink
          key={category.id}
          href={`/categories/${category.slug}`}
          className={styles.tile}
          style={{ animationDelay: `${(expanded ? Math.max(0, index - COLLAPSED_COUNT) : index) * 40}ms` }}
        >
          <span className={styles.badge}>
            {category.image ? (
              <Image src={category.image} alt="" fill sizes="120px" className={styles.image} />
            ) : (
              <span className={styles.initial}>{category.name.charAt(0).toUpperCase()}</span>
            )}
          </span>
          <span className={styles.label}>{category.name}</span>
        </LocaleLink>
      ))}

      {collapsible && (
        <button
          type="button"
          className={`${styles.tile} ${styles.toggle}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className={`${styles.badge} ${styles.toggleBadge}`}>
            {expanded ? (
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
                <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className={styles.toggleCount}>+{categories.length - COLLAPSED_COUNT}</span>
            )}
          </span>
          <span className={styles.label}>
            {expanded ? dict.home.categoriesShowLess : dict.home.categoriesShowAll(categories.length)}
          </span>
        </button>
      )}
    </nav>
  );
}
