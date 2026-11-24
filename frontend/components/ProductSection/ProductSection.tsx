"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import ProductCard from "@/components/ProductCard/ProductCard";
import { SlideshowConductor } from "@/lib/slideshowConductor";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./ProductSection.module.css";

interface ProductSectionProps {
  titleKey:
    | "saleTitle"
    | "popularTitle"
    | "bestSellersTitle"
    | "dealsTitle"
    | "recommendedTitle"
    | "frequentlyBoughtTitle"
    | "alsoViewedTitle"
    | "moreFromBrandTitle"
    | "recentlyViewedTitle"
    | "recommendedForYouTitle"
    | "megaDealsTitle"
    | "newArrivalsTitle"
    | "lowPricesTitle";
  /** Overrides the dictionary title (e.g. a category name). */
  title?: string;
  products: Product[];
  cardLayout?: "row" | "column" | "market";
  /** Anchor target (homepage banners link to some rows). */
  id?: string;
  /** Shows a "Voir tout" link in the header. */
  viewAllHref?: string;
  /** Rendered next to the title (e.g. a countdown). */
  headerExtra?: ReactNode;
  /** "highlight" sets the row on a tinted panel (Méga offres). */
  tone?: "default" | "highlight";
}

export default function ProductSection({
  titleKey,
  title: titleOverride,
  products,
  cardLayout = "row",
  id,
  viewAllHref,
  headerExtra,
  tone = "default",
}: ProductSectionProps) {
  const dict = useDictionary();
  const title = titleOverride ?? dict.home[titleKey];
  // Existing callers (no link, no extra) keep the bare <h2> exactly as before.
  const hasRichHeader = Boolean(viewAllHref || headerExtra);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function checkOverflow() {
      if (track) setCanScroll(track.scrollWidth > track.clientWidth + 1);
    }

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(track);
    return () => observer.disconnect();
  }, [products]);

  function scroll(direction: -1 | 1) {
    trackRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  }

  return (
    <SlideshowConductor>
      <section
        id={id}
        className={[styles.section, tone === "highlight" && styles.highlight, id && styles.anchored]
          .filter(Boolean)
          .join(" ")}
      >
        {hasRichHeader ? (
          <div className={styles.header}>
            <div className={styles.headerMain}>
              <h2 className={styles.title}>{title}</h2>
              {headerExtra}
            </div>
            {viewAllHref && (
              <LocaleLink href={viewAllHref} className={styles.viewAll}>
                {dict.common.seeAll}
              </LocaleLink>
            )}
          </div>
        ) : (
          <h2 className={styles.title}>{title}</h2>
        )}

        <div className={`${styles.trackWrapper} ${cardLayout === "market" ? styles.marketWrapper : ""}`}>
          <div ref={trackRef} className={styles.track}>
            {products.map((product) => (
              <div className={cardLayout === "market" ? styles.marketItem : styles.item} key={product.id}>
                <ProductCard product={product} layout={cardLayout} swipeable={false} />
              </div>
            ))}
          </div>

          {canScroll && (
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
    </SlideshowConductor>
  );
}
