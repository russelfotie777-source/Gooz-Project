"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./Header.module.css";

interface HeaderCategoriesNavProps {
  categories: Category[];
}

// Desktop categories row under the header. It overflows (40+ categories)
// with its scrollbar hidden, and a mouse wheel only scrolls vertically — so
// without help a mouse user could never reach the end of the list, where
// the newest categories land. Arrows appear on whichever side has more,
// and a vertical wheel over the row scrolls it sideways.
export default function HeaderCategoriesNav({ categories }: HeaderCategoriesNavProps) {
  const dict = useDictionary();
  const navRef = useRef<HTMLElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    function update() {
      if (!nav) return;
      setCanPrev(nav.scrollLeft > 2);
      setCanNext(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2);
    }

    // Vertical wheel → horizontal scroll (non-passive so the page itself
    // doesn't scroll while the row moves; untouched once at either end).
    function onWheel(e: WheelEvent) {
      if (!nav || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = nav.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      nav.scrollLeft += e.deltaY;
    }

    update();
    nav.addEventListener("scroll", update, { passive: true });
    nav.addEventListener("wheel", onWheel, { passive: false });
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    return () => {
      nav.removeEventListener("scroll", update);
      nav.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, [categories]);

  function scrollByPage(direction: -1 | 1) {
    const nav = navRef.current;
    if (nav) nav.scrollBy({ left: direction * nav.clientWidth * 0.75, behavior: "smooth" });
  }

  return (
    <div className={styles.categoriesBarWrap}>
      <nav ref={navRef} className={styles.categoriesBar} aria-label={dict.header.categories}>
        {categories.map((category) => (
          <LocaleLink key={category.id} href={`/categories/${category.slug}`} className={styles.categoryButton}>
            {category.image && <img src={category.image} alt="" className={styles.categoryIcon} />}
            <span className={styles.categoryLabel}>{category.name}</span>
          </LocaleLink>
        ))}
      </nav>

      {canPrev && (
        <button
          type="button"
          className={`${styles.categoriesArrow} ${styles.categoriesArrowPrev}`}
          aria-label={dict.common.previous}
          onClick={() => scrollByPage(-1)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {canNext && (
        <button
          type="button"
          className={`${styles.categoriesArrow} ${styles.categoriesArrowNext}`}
          aria-label={dict.common.next}
          onClick={() => scrollByPage(1)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
