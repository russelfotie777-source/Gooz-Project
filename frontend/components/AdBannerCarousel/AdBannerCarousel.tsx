"use client";

import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/api";
import type { Banner } from "@/lib/types";
import styles from "./AdBannerCarousel.module.css";

interface AdBannerCarouselProps {
  /** Admin-managed (location homepage_ad_1/2 — see Admin\BannerController).
   *  As many as an admin adds; an empty list renders nothing, same as the
   *  main hero when it has no active banners. */
  banners: Banner[];
}

const SLIDE_MS = 4500;
// Half of .image's CSS transition-duration (see AdBannerCarousel.module.css)
// — the image only swaps once fully faded out, so there's never a hard cut
// or a flash of the frame's bare background between two slides.
const FADE_MS = 250;

export default function AdBannerCarousel({ banners }: AdBannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const slideCount = banners.length;

  useEffect(() => {
    setIndex(0);
    setDisplayIndex(0);
  }, [banners]);

  useEffect(() => {
    if (index === displayIndex) return;
    setFading(true);
    const timer = window.setTimeout(() => {
      setDisplayIndex(index);
      setFading(false);
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [index, displayIndex]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slideCount), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slideCount]);

  const banner = banners[displayIndex];
  if (!banner) return null;

  return (
    <div className={styles.frame}>
      <img
        src={resolveMediaUrl(banner.image)}
        alt={banner.title}
        className={`${styles.image} ${fading ? styles.imageFading : ""}`}
      />
    </div>
  );
}
