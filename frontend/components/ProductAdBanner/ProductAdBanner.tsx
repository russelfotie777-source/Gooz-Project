"use client";

import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/api";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { productPath } from "@/lib/productUrl";
import type { Banner } from "@/lib/types";
import styles from "./ProductAdBanner.module.css";

interface ProductAdBannerProps {
  /** Admin-managed (location "product" — see Admin\BannerController). As
   *  many as an admin adds; an empty list renders nothing, same as the
   *  static image this replaced. */
  banners: Banner[];
}

const SLIDE_MS = 4500;
// Half of .slide's CSS transition-duration (see ProductAdBanner.module.css)
// — the image only swaps once fully faded out, so there's never a hard cut
// or a flash of the frame's bare background between two slides.
const FADE_MS = 250;

// Unlike the hero carousel, this slot never crops (object-fit: cover) or
// overlays a title/scrim — per docs/dimensions-bannieres.md §5, the whole
// image is always shown at its own aspect ratio, exactly like the static
// ad-banner.jpg this replaced. show_overlay is ignored here on purpose:
// this spot was never designed to carry a site-rendered title over the
// image, so there's nothing to toggle.
export default function ProductAdBanner({ banners }: ProductAdBannerProps) {
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

  const image = (
    <img
      src={resolveMediaUrl(banner.image)}
      alt={banner.title}
      className={`${styles.slide} ${fading ? styles.slideFading : ""}`}
    />
  );

  if (banner.link_type === "product" && banner.product) {
    return (
      <LocaleLink href={productPath(banner.product)} className={styles.frame}>
        {image}
      </LocaleLink>
    );
  }

  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className={styles.frame}>
        {image}
      </a>
    );
  }

  return <div className={styles.frame}>{image}</div>;
}
