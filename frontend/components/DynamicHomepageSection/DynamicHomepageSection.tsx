"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard/ProductCard";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import type { HomepageSection } from "@/lib/types";
import styles from "./DynamicHomepageSection.module.css";

interface DynamicHomepageSectionProps {
  section: HomepageSection;
}

// Renders one section configured in the admin panel (Admin\HomepageSectionController) —
// additive to the hand-built sections already in HomePage.tsx, not a
// replacement for any of them. content_type switches the card rendered:
// category_list/brand_list strategies resolve to categories/brands, not
// products (see HomepageSectionController::present() on the backend).
export default function DynamicHomepageSection({ section }: DynamicHomepageSectionProps) {
  const dict = useDictionary();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const isHorizontal = section.display_layout === "horizontal_list";

  const itemCount =
    section.content_type === "products"
      ? section.products.length
      : section.content_type === "categories"
        ? section.categories.length
        : section.brands.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isHorizontal) return;

    function checkOverflow() {
      if (track) setCanScroll(track.scrollWidth > track.clientWidth + 1);
    }

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(track);
    return () => observer.disconnect();
  }, [isHorizontal, itemCount]);

  function scroll(direction: -1 | 1) {
    trackRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  }

  if (itemCount === 0) return null;

  return (
    <section className={styles.section}>
      {(section.show_title || section.show_view_all) && (
        <div className={styles.header}>
          {section.show_title && <h2 className={styles.title}>{section.display_title}</h2>}
          {section.show_view_all && (
            <LocaleLink href={section.view_all_url} className={styles.viewAll}>
              {dict.common.seeAll}
            </LocaleLink>
          )}
        </div>
      )}
      {section.description && <p className={styles.description}>{section.description}</p>}

      <div className={styles.trackWrapper}>
        <div
          ref={trackRef}
          className={`${styles.track} ${isHorizontal ? styles.trackHorizontal : styles.trackGrid}`}
        >
          {section.content_type === "products" &&
            section.products.map((product) => (
              <div className={styles.item} key={product.id}>
                <ProductCard product={product} layout={isHorizontal ? "row" : "column"} />
              </div>
            ))}

          {section.content_type === "categories" &&
            section.categories.map((category) => (
              <LocaleLink href={`/categories/${category.slug}`} className={styles.cardItem} key={category.id}>
                <span className={styles.cardBadge}>
                  {category.image ? (
                    <Image src={category.image} alt="" fill sizes="72px" className={styles.cardImage} />
                  ) : (
                    <span className={styles.cardInitial}>{category.name.charAt(0).toUpperCase()}</span>
                  )}
                </span>
                <span className={styles.cardName}>{category.name}</span>
              </LocaleLink>
            ))}

          {section.content_type === "brands" &&
            section.brands.map((brand) => (
              <div className={styles.cardItem} key={brand.id}>
                <span className={styles.cardBadge}>
                  {brand.logo ? (
                    <Image src={brand.logo} alt="" fill sizes="72px" className={styles.cardImage} />
                  ) : (
                    <span className={styles.cardInitial}>{brand.name.charAt(0).toUpperCase()}</span>
                  )}
                </span>
                <span className={styles.cardName}>{brand.name}</span>
              </div>
            ))}
        </div>

        {isHorizontal && canScroll && (
          <>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navButtonPrev}`}
              aria-label={dict.common.previous}
              onClick={() => scroll(-1)}
            >
              <img
                src="/icon/product-section/nav-arrow.svg"
                alt=""
                className={`${styles.navIcon} ${styles.navIconFlipped}`}
              />
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navButtonNext}`}
              aria-label={dict.common.next}
              onClick={() => scroll(1)}
            >
              <img src="/icon/product-section/nav-arrow.svg" alt="" className={styles.navIcon} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
