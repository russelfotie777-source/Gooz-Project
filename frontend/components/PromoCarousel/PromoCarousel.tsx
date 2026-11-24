"use client";

import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { PROMO_SIDE, PROMO_SLIDES } from "@/lib/homeBanners";
import styles from "./PromoCarousel.module.css";

const INTERVAL_MS = 4500;
const SWIPE_PX = 40;

// Homepage promo block between "Recommandé pour vous" and "Méga offres":
// an auto-advancing slide carousel (pauses on hover/focus, swipeable,
// progress-filled dots) next to a fixed side panel meant for a GIF.
// Creatives and links live in lib/homeBanners.ts.
export default function PromoCarousel() {
  const dict = useDictionary();
  const count = PROMO_SLIDES.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const autoplay = count > 1 && !paused && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    // Restarted on every index change, so a manual click gives the new
    // slide a full interval (and its dot's progress bar restarts in sync).
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, index, count]);

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  if (count === 0) return null;

  return (
    <section className={styles.promo} aria-roledescription="carousel" aria-label="Promotions">
      <div
        className={styles.main}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className={styles.track} style={{ transform: `translateX(-${index * 100}%)` }}>
          {PROMO_SLIDES.map((slide, i) => (
            <LocaleLink
              key={slide.src}
              href={slide.href}
              className={styles.slide}
              aria-hidden={i !== index}
              tabIndex={i === index ? undefined : -1}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
                className={styles.slideImage}
              />
            </LocaleLink>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              aria-label={dict.common.previous}
              onClick={() => go(-1)}
            >
              <Chevron flipped />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              aria-label={dict.common.next}
              onClick={() => go(1)}
            >
              <Chevron />
            </button>

            <div className={styles.dots}>
              {PROMO_SLIDES.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                  aria-label={dict.home.heroSlide(i + 1)}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                >
                  {i === index && autoplay && (
                    <span key={index} className={styles.dotFill} style={{ animationDuration: `${INTERVAL_MS}ms` }} />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <LocaleLink href={PROMO_SIDE.href} className={styles.side}>
        <img
          src={PROMO_SIDE.src}
          alt={PROMO_SIDE.alt}
          width={PROMO_SIDE.width}
          height={PROMO_SIDE.height}
          loading="lazy"
          className={styles.sideImage}
        />
      </LocaleLink>
    </section>
  );
}

function Chevron({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
      style={flipped ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
