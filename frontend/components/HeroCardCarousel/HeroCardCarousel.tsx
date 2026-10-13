"use client";

import { useEffect, useRef } from "react";
import { resolveMediaUrl } from "@/lib/api";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { productPath } from "@/lib/productUrl";
import type { Banner } from "@/lib/types";
import styles from "./HeroCardCarousel.module.css";

const AUTO_ADVANCE_MS = 3500;
// Swiping is how someone actually browses this carousel — if autoplay kept
// firing mid-gesture it would fight (and visibly stutter against) their own
// scroll. Any touch/wheel interaction holds autoplay off for this long
// before it resumes, rather than snapping back immediately.
const PAUSE_AFTER_INTERACTION_MS = 5000;

interface HeroCardCarouselProps {
  /** Admin-managed (location "homepage") — appended after DEFAULT_CARDS
   *  below, never replacing them (same "slide 0 is always the brand slide"
   *  convention HeroBanner already uses for desktop). */
  banners: Banner[];
}

// Mobile-only (see the max-width rule below) — matches noon.com's mobile
// hero: several full-bleed promo cards, each a single flat image (no
// separately rendered title/CTA — the creative already has everything
// baked in, confirmed against noon's own cards), laid out as a horizontally
// swipeable, center-snapping carousel where the active card sits centered
// with its neighbors peeking in on both sides. Desktop keeps HeroBanner
// exactly as it was — see HeroSection.module.css, which hides .heroWrapper
// (HeroBanner's wrapper) below 1024px and this component's own wrapper
// above it, instead of either component touching the other's markup.
const DEFAULT_CARDS = [
  { id: "default-1", image: "/images/hero/card-welcome.jpg", alt: "Bienvenue chez Shopitech — 15% de cashback" },
  { id: "default-2", image: "/images/hero/hero-blender.jpg", alt: "Blender Hisense" },
  { id: "default-3", image: "/images/hero/hero-asus.jpg", alt: "ASUS ZenBook Pro" },
  { id: "default-4", image: "/images/hero/hero-hp.jpg", alt: "HP Spectre X360" },
  { id: "default-5", image: "/images/hero/hero-airpod.jpg", alt: "AirPods Pro " },
  { id: "default-6", image:  "/images/hero/hero-souris.jpg", alt: "Souris Logitech" },
];

export default function HeroCardCarousel({ banners }: HeroCardCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const timer = window.setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;

      const firstCard = track.firstElementChild as HTMLElement | null;
      if (!firstCard) return;

      // Measured off the real DOM (card width + the track's own gap) rather
      // than duplicating .card's 220px/.track's 12px as constants here —
      // this stays correct even if the CSS changes.
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
      const step = firstCard.getBoundingClientRect().width + gap;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;

      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: "smooth" });
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, []);

  function pauseAutoplay() {
    pausedUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS;
  }

  return (
    <div className={styles.track} ref={trackRef} onPointerDown={pauseAutoplay} onWheel={pauseAutoplay}>
      {DEFAULT_CARDS.map((card) => (
        <div className={styles.card} key={card.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt={card.alt} className={styles.cardImage} />
        </div>
      ))}

      {banners.map((banner) => {
        const image = (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveMediaUrl(banner.image)} alt={banner.title} className={styles.cardImage} />
        );

        if (banner.link_type === "product" && banner.product) {
          return (
            <LocaleLink href={productPath(banner.product)} className={styles.card} key={banner.id}>
              {image}
            </LocaleLink>
          );
        }

        if (banner.link_url) {
          return (
            <a
              href={banner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
              key={banner.id}
            >
              {image}
            </a>
          );
        }

        return (
          <div className={styles.card} key={banner.id}>
            {image}
          </div>
        );
      })}
    </div>
  );
}
