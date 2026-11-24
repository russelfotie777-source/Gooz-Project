"use client";

import Image from "next/image";
import type { Category } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./CategoryGrid.module.css";

interface CategoryGridProps {
  /** Already ordered (biggest first — see sortCategoriesBySize). */
  categories: Category[];
}

const MAX_CATEGORIES = 12;

// Desktop-only round category tiles (phones already get CategoryList right
// under the hero, so showing both there would just repeat it).
export default function CategoryGrid({ categories }: CategoryGridProps) {
  const dict = useDictionary();
  if (categories.length === 0) return null;

  return (
    <nav className={styles.grid} aria-label={dict.home.categoriesNav}>
      {categories.slice(0, MAX_CATEGORIES).map((category, index) => (
        <LocaleLink
          key={category.id}
          href={`/categories/${category.slug}`}
          className={styles.tile}
          style={{ animationDelay: `${index * 40}ms` }}
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
    </nav>
  );
}
