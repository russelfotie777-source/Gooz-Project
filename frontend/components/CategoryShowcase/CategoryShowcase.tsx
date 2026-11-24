"use client";

import Image from "next/image";
import type { Category, Product } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import ProductSection from "@/components/ProductSection/ProductSection";
import styles from "./CategoryShowcase.module.css";

interface CategoryShowcaseProps {
  category: Category;
  products: Product[];
  /** Position among the showcases — picks the panel's color so consecutive
   *  showcases don't look identical. */
  index: number;
}

const TONES = ["toneBlue", "toneNavy", "toneOrange"] as const;

// A dedicated row for one of the catalogue's biggest categories (chosen by
// pickShowcaseCategories): a feature panel — the category's own admin image
// behind a scrim, or a plain brand gradient without one — next to a
// carousel of that category's products.
export default function CategoryShowcase({ category, products, index }: CategoryShowcaseProps) {
  const dict = useDictionary();
  const href = `/categories/${category.slug}`;
  const tone = styles[TONES[index % TONES.length]];

  return (
    <div className={styles.showcase}>
      <LocaleLink href={href} className={`${styles.panel} ${tone}`}>
        {category.image && (
          <Image src={category.image} alt="" fill sizes="(min-width: 1024px) 280px, 100vw" className={styles.panelImage} />
        )}
        <span className={styles.panelBody}>
          <span className={styles.kicker}>{dict.home.showcase.kicker}</span>
          <span className={styles.name}>{category.name}</span>
          {category.products_count ? (
            <span className={styles.count}>{dict.home.showcase.productsCount(category.products_count)}</span>
          ) : null}
          <span className={styles.cta}>
            {dict.home.showcase.cta}
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </LocaleLink>

      <div className={styles.row}>
        <ProductSection
          titleKey="bestSellersTitle"
          title={category.name}
          products={products}
          cardLayout="market"
          viewAllHref={href}
        />
      </div>
    </div>
  );
}
