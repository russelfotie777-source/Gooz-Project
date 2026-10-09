"use client";

import type { Category } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./CategoryList.module.css";

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  const dict = useDictionary();

  return (
    <nav className={styles.wrapper} aria-label={dict.home.categoriesNav}>
      <ul className={styles.list}>
        {categories.map((category) => (
          <li key={category.id} className={styles.item}>
            <LocaleLink href={`/categories/${category.slug}`} className={styles.button}>
              <span className={styles.iconCircle}>
                {category.image ? (
                  <img src={category.image} alt="" className={styles.iconImage} />
                ) : (
                  <span className={styles.iconInitial}>{category.name.charAt(0).toUpperCase()}</span>
                )}
              </span>
              <span className={styles.label}>{category.name}</span>
            </LocaleLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
