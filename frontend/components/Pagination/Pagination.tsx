"use client";

import { useEffect, useRef } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  lastPage: number;
  loading?: boolean;
  /** Builds the real, crawlable href for a given page — see the callers'
   *  own pageHref (CatalogueSection/CategoryResults). */
  pageHref: (n: number) => string;
  /** The actual client-side page change (fetch + state update) — see the
   *  callers' own goToPage. */
  onNavigate: (n: number) => void;
}

type PageItem = number | "dots-left" | "dots-right";

// Standard "windowed" page list: always the first and last page, the
// current page, and one sibling on each side — "…" fills any wider gap
// instead of ever printing dozens of numbers in a row. Used for the
// desktop layout only; the mobile layout (see .mobileNumbers) shows every
// page instead, since it scrolls rather than wrapping/overflowing.
function buildPageWindow(page: number, lastPage: number): PageItem[] {
  const siblingCount = 1;
  const totalVisible = siblingCount * 2 + 5; // first + last + current + 2 siblings + a little slack

  if (lastPage <= totalVisible) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, lastPage);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < lastPage - 1;

  if (!showLeftDots && showRightDots) {
    const count = 3 + siblingCount * 2;
    return [...Array.from({ length: count }, (_, i) => i + 1), "dots-right", lastPage];
  }

  if (showLeftDots && !showRightDots) {
    const count = 3 + siblingCount * 2;
    return [1, "dots-left", ...Array.from({ length: count }, (_, i) => lastPage - count + i + 1)];
  }

  const middle = Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i);
  return [1, "dots-left", ...middle, "dots-right", lastPage];
}

export default function Pagination({ page, lastPage, loading = false, pageHref, onNavigate }: PaginationProps) {
  const dict = useDictionary();
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  // Keeps the active page centered in the scrollable mobile strip whenever
  // it changes — including via the arrow buttons, not just a direct tap on
  // a number.
  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const activeEl = track.querySelector<HTMLElement>(`[data-page="${page}"]`);
    activeEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [page]);

  if (lastPage <= 1) return null;

  function renderNumber(n: number) {
    return (
      // A real <a href> (not a plain button) — this is what actually lets
      // a crawler discover page 2+ at all, by following a real link
      // instead of needing to run an onClick handler. Clicking it still
      // gets the fast client-side refetch via onNavigate, same as before;
      // e.preventDefault() just stops Next's own Link navigation from
      // doing it a second time.
      <LocaleLink
        key={n}
        data-page={n}
        href={pageHref(n)}
        className={`${styles.pageNumber} ${n === page ? styles.pageNumberActive : ""}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(n);
        }}
        aria-current={n === page ? "page" : undefined}
      >
        {n}
      </LocaleLink>
    );
  }

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.pageArrow}
        onClick={() => onNavigate(Math.max(1, page - 1))}
        disabled={page === 1 || loading}
        aria-label={dict.common.previous}
      >
        ‹
      </button>

      <div className={styles.desktopNumbers}>
        {buildPageWindow(page, lastPage).map((item, i) =>
          typeof item === "number" ? (
            renderNumber(item)
          ) : (
            <span key={`${item}-${i}`} className={styles.dots} aria-hidden="true">
              …
            </span>
          )
        )}
      </div>

      <div className={styles.mobileNumbers} ref={mobileTrackRef}>
        {Array.from({ length: lastPage }, (_, i) => i + 1).map((n) => renderNumber(n))}
      </div>

      <button
        type="button"
        className={styles.pageArrow}
        onClick={() => onNavigate(Math.min(lastPage, page + 1))}
        disabled={page === lastPage || loading}
        aria-label={dict.common.next}
      >
        ›
      </button>
    </div>
  );
}
