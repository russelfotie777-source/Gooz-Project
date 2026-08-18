"use client";

import type { Brand } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./BrandsSection.module.css";

interface BrandsSectionProps {
  brands: Brand[];
}

export default function BrandsSection({ brands }: BrandsSectionProps) {
  const dict = useDictionary();

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{dict.home.brandsTitle}</h2>
      <div className={styles.track}>
        {brands.map((brand) => (
          <div className={styles.item} key={brand.id}>
            <div className={styles.badge}>
              {brand.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logo} alt="" className={styles.logo} />
              ) : (
                <span className={styles.initial}>{brand.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className={styles.name}>{brand.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
