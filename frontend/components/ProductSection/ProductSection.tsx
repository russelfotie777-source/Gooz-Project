"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./ProductSection.module.css";

interface ProductSectionProps {
  title: string;
  products: Product[];
  cardLayout?: "row" | "column";
}

export default function ProductSection({
  title,
  products,
  cardLayout = "row",
}: ProductSectionProps) {
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
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.trackWrapper}>
        <div ref={trackRef} className={styles.track}>
          {products.map((product) => (
            <div className={styles.item} key={product.id}>
              <ProductCard product={product} layout={cardLayout} />
            </div>
          ))}
        </div>

        {canScroll && (
          <>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navButtonPrev}`}
              aria-label="Précédent"
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
              aria-label="Suivant"
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
