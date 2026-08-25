"use client";

import type { Brand } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./BrandsSection.module.css";

interface BrandsSectionProps {
  brands: Brand[];
}

// Flat continuous logo strip (no card/circle around each logo — see the
// reference the user gave), looping forever via a CSS-only marquee: the
// list is rendered twice back-to-back inside a track exactly twice as wide,
// animated by exactly -50% so the seam between the two copies is invisible
// and the loop never visibly "resets". Pure CSS on purpose — no JS/layout
// measurement needed, works the same server-rendered or not.
export default function BrandsSection({ brands }: BrandsSectionProps) {
  const dict = useDictionary();

  if (brands.length === 0) return null;

  // Duration scales with the list length so the strip moves at roughly the
  // same visual speed (px/s) whether there are 5 brands or 20 — a fixed
  // duration would make a longer catalogue race past.
  const duration = Math.max(brands.length * 3, 18);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{dict.home.brandsTitle}</h2>
      <div className={styles.trackWrapper}>
        <div className={styles.track} style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}>
          <BrandLogos brands={brands} />
          <BrandLogos brands={brands} ariaHidden />
        </div>
      </div>
    </section>
  );
}

function BrandLogos({ brands, ariaHidden }: { brands: Brand[]; ariaHidden?: boolean }) {
  return (
    <div className={styles.logoSet} aria-hidden={ariaHidden || undefined}>
      {brands.map((brand, index) => (
        <div className={styles.item} key={`${brand.id}-${ariaHidden ? "dup" : "orig"}-${index}`}>
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt={brand.name} className={styles.logo} />
          ) : (
            <span className={styles.fallbackName}>{brand.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}
