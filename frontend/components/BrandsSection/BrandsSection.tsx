"use client";

import { useEffect, useRef } from "react";
import type { Brand } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./BrandsSection.module.css";

interface BrandsSectionProps {
  brands: Brand[];
}

// Constant visual speed (px/s) regardless of how many brands there are —
// used to be a CSS animation-duration scaled by list length to get the same
// effect; driving the position by hand can just target a fixed speed
// directly instead.
const PX_PER_SECOND = 40;
// Below this many pixels of movement, a touch/pointer gesture is still
// read as a tap (so a logo link navigates) rather than a drag.
const DRAG_COMMIT_PX = 6;
// Same idea as HeroCardCarousel's own pause-after-interaction: a drag
// shouldn't have the auto-advance immediately resume and fight it right as
// it ends.
const PAUSE_AFTER_INTERACTION_MS = 2500;

// Flat continuous logo strip (no card/circle around each logo — see the
// reference the user gave). The list is rendered twice back-to-back inside
// a track exactly twice as wide; position is a single `transform:
// translateX()` offset, auto-advanced every frame and also directly
// draggable by hand — both just move the same number. Wrapping both ways
// (not only forward) keeps a backward drag from ever hitting a dead end:
// the offset is normalized into the (-halfWidth, 0] range on every update,
// landing back inside the pixel-identical second copy no matter which
// direction it was pushed past the seam.
//
// Driven by hand (touch-action: pan-y + reading pointer deltas), not native
// horizontal scroll — ProductCard went through the same thing (see its own
// comment): a native overflow-x scroller nested in a vertically-scrolling
// page isn't reliably guaranteed to release a mostly-vertical drag back to
// the page on every engine, even with touch-action set. Letting the browser
// handle only vertical panning here, and reading horizontal movement in JS,
// sidesteps that regardless of engine.
export default function BrandsSection({ brands }: BrandsSectionProps) {
  const dict = useDictionary();
  const wrapperRef = useRef<HTMLDivElement>(null);
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
    if (!track || brands.length === 0) return;
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
  }, [brands.length]);

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
    // Desktop two-finger trackpad/mouse horizontal scroll reports deltaX
    // directly — nudge the offset by hand so it moves the same as a drag
    // (there's no native scrollLeft here for the browser to apply this to).
    if (e.deltaX === 0) return;
    e.preventDefault();
    offsetRef.current -= e.deltaX;
    applyOffset(trackRef.current ? trackRef.current.scrollWidth / 2 : 0);
  }

  if (brands.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{dict.home.brandsTitle}</h2>
      <div
        className={styles.trackWrapper}
        ref={wrapperRef}
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
        <LocaleLink
          href={`/marques/${brand.slug}`}
          className={styles.item}
          key={`${brand.id}-${ariaHidden ? "dup" : "orig"}-${index}`}
          tabIndex={ariaHidden ? -1 : undefined}
          draggable={false}
        >
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt={brand.name} className={styles.logo} draggable={false} />
          ) : (
            <span className={styles.fallbackName}>{brand.name}</span>
          )}
        </LocaleLink>
      ))}
    </div>
  );
}
