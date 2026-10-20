"use client";

import { useEffect, useRef } from "react";
import type { Category } from "@/lib/types";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./CategoriesBar.module.css";

interface CategoriesBarProps {
  categories: Category[];
  label: string;
}

// Same auto-advancing, hand-draggable strip as BrandsSection (see that
// file's own comments for the full reasoning) — the category list rendered
// twice back-to-back inside a track exactly twice as wide, position driven
// by a single translateX() offset that's both auto-advanced every frame and
// directly draggable, wrapped into range on every update so a drag past
// either end always lands back inside the pixel-identical duplicate.
const PX_PER_SECOND = 26;
const DRAG_COMMIT_PX = 6;
const PAUSE_AFTER_INTERACTION_MS = 2500;

export default function CategoriesBar({ categories, label }: CategoriesBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedUntilRef = useRef(0);
  const hoveredRef = useRef(false);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: number;
    committed: "horizontal" | "vertical" | null;
  } | null>(null);
  const suppressNextClick = useRef(false);

  function applyOffset(halfWidth: number) {
    if (halfWidth > 0) {
      offsetRef.current = ((offsetRef.current % halfWidth) + halfWidth) % halfWidth;
      offsetRef.current -= halfWidth;
    }
    if (trackRef.current) trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track || categories.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId: number;
    let lastTime: number | null = null;

    function tick(time: number) {
      const dt = lastTime === null ? 0 : time - lastTime;
      lastTime = time;
      const halfWidth = track!.scrollWidth / 2;

      if (!hoveredRef.current && !dragState.current && Date.now() >= pausedUntilRef.current) {
        offsetRef.current -= (PX_PER_SECOND * dt) / 1000;
        applyOffset(halfWidth);
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [categories.length]);

  function handlePointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: offsetRef.current,
      committed: null,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;

    if (drag.committed === null) {
      if (Math.abs(deltaX) < DRAG_COMMIT_PX && Math.abs(deltaY) < DRAG_COMMIT_PX) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        dragState.current = null;
        return;
      }
      drag.committed = "horizontal";
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    e.preventDefault();
    offsetRef.current = drag.startOffset + deltaX;
    applyOffset(trackRef.current ? trackRef.current.scrollWidth / 2 : 0);
  }

  function handlePointerUp(e: React.PointerEvent) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragState.current = null;
    if (drag.committed !== "horizontal") return;
    pausedUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS;
    suppressNextClick.current = true;
  }

  function handlePointerCancel(e: React.PointerEvent) {
    if (dragState.current?.pointerId !== e.pointerId) return;
    dragState.current = null;
  }

  function handleClickCapture(e: React.MouseEvent) {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function handleWheel(e: React.WheelEvent) {
    pausedUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS;
    if (e.deltaX === 0) return;
    e.preventDefault();
    offsetRef.current -= e.deltaX;
    applyOffset(trackRef.current ? trackRef.current.scrollWidth / 2 : 0);
  }

  if (categories.length === 0) return null;

  return (
    <nav
      className={styles.trackWrapper}
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
      onWheel={handleWheel}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      onFocus={() => {
        pausedUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS;
      }}
    >
      <div className={styles.track} ref={trackRef}>
        <CategoryLinks categories={categories} />
        <CategoryLinks categories={categories} ariaHidden />
      </div>
    </nav>
  );
}

function CategoryLinks({ categories, ariaHidden }: { categories: Category[]; ariaHidden?: boolean }) {
  return (
    <div className={styles.itemSet} aria-hidden={ariaHidden || undefined}>
      {categories.map((category, index) => (
        <LocaleLink
          href={`/categories/${category.slug}`}
          className={styles.categoryButton}
          key={`${category.id}-${ariaHidden ? "dup" : "orig"}-${index}`}
          tabIndex={ariaHidden ? -1 : undefined}
          draggable={false}
        >
          {category.image && <img src={category.image} alt="" className={styles.categoryIcon} draggable={false} />}
          <span className={styles.categoryLabel}>{category.name}</span>
        </LocaleLink>
      ))}
    </div>
  );
}
