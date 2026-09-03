"use client";

import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { productPath } from "@/lib/productUrl";
import type { Banner } from "@/lib/types";
import styles from "./HeroBanner.module.css";

interface HeroBannerProps {
  banners: Banner[];
}

const AUTO_ADVANCE_MS = 6000;
// Half of .slide's CSS transition-duration (see HeroBanner.module.css) —
// content only swaps once fully faded out, so there's never a hard cut or a
// flash of the banner's bare background between two slides. A crossfade
// rather than a literal slide/swipe on purpose: a real horizontal swipe
// needs to clip the banner while it's in motion, which would cut off the
// fallback slide's product image where it deliberately pops outside the
// frame — the whole point of that slide's look.
const FADE_MS = 250;

// Slide 0 is always the static Shopitech brand slide — a permanent first
// slide, not just a fallback shown only when no banners are configured.
// Real banners (managed in the admin — see BannerController) are appended
// after it, so adding one never hides it; it just gives the carousel more
// slides to cycle through before looping back to slide 0.
export default function HeroBanner({ banners }: HeroBannerProps) {
  const dict = useDictionary();
  const [index, setIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const slideCount = banners.length + 1;
  const hasMultipleSlides = slideCount > 1;

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
    if (!hasMultipleSlides) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slideCount), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [hasMultipleSlides, slideCount]);

  function goTo(target: number) {
    setIndex(((target % slideCount) + slideCount) % slideCount);
  }

  const banner = displayIndex > 0 ? banners[displayIndex - 1] : null;

  return (
    <section className={styles.banner}>
      {/* No key here on purpose: the same element stays mounted across
          slides so the CSS opacity transition below can actually
          interpolate — a plain background-image swap doesn't animate at all
          (that property isn't transition-able), which is why this never had
          a transition before. */}
      <div
        className={`${styles.slide} ${banner ? styles.slideWithImage : ""} ${fading ? styles.slideFading : ""}`}
        style={banner ? { backgroundImage: `url(${resolveMediaUrl(banner.image)})` } : undefined}
      >
        {banner ? (
          <>
            <div className={styles.scrim} aria-hidden="true" />
            <div className={styles.content}>
              <h1 className={styles.title}>{banner.title}</h1>
              {banner.description && <p className={styles.description}>{banner.description}</p>}
              {banner.link_type === "product" && banner.product ? (
                <LocaleLink href={productPath(banner.product)} className={styles.cta}>
                  {dict.home.heroCta}
                </LocaleLink>
              ) : (
                banner.link_url && (
                  <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className={styles.cta}>
                    {dict.home.heroCtaExternal}
                  </a>
                )
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.content}>
              <h1 className={styles.title}>
                Shop<span className={styles.titleAccent}>itech</span>
              </h1>
              <p className={styles.subtitle}>{dict.home.heroFallbackSubtitle}</p>
              <p className={styles.description}>{dict.home.heroFallbackDescription}</p>
              {/* Same-page anchor, not a route — this fallback renders inside
                  both HomePage and CategoryPage (via HeroSection), and both
                  give their product grid the id "catalogue" (see
                  CatalogueSection.tsx / CategoryResults.tsx). There was never
                  a standalone "/categories" index page, so this used to be a
                  dead link. */}
              <LocaleLink href="#catalogue" className={styles.cta}>
                {dict.home.heroFallbackCta}
              </LocaleLink>
            </div>

            {/* Deliberately allowed to spill outside the banner's box (see
                .imageWrapper's negative top/bottom insets) — .banner stays
                overflow:visible always so this never gets clipped. */}
            <div className={styles.imageWrapper} aria-hidden="true">
              <div className={styles.circleWrapper}>
                <img src="/images/hero/circle-decoration.svg" alt="" className={styles.circleDecoration} />
              </div>
              <img src="/images/hero/product-camera.png" alt="" className={styles.productImage} />
            </div>
          </>
        )}
      </div>

      {hasMultipleSlides && (
        <>
          <div className={styles.dots}>
            {Array.from({ length: slideCount }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={dict.home.heroSlide(i + 1)}
                aria-current={i === index}
              />
            ))}
          </div>

          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            aria-label={dict.common.previous}
            onClick={() => goTo(index - 1)}
          >
            <img src="/images/hero/arrow-bg.svg" alt="" className={styles.navButtonBg} />
            <img
              src="/images/hero/arrow-chevron.svg"
              alt=""
              className={`${styles.navButtonIcon} ${styles.navButtonIconFlipped}`}
            />
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonNext}`}
            aria-label={dict.common.next}
            onClick={() => goTo(index + 1)}
          >
            <img src="/images/hero/arrow-bg.svg" alt="" className={styles.navButtonBg} />
            <img src="/images/hero/arrow-chevron.svg" alt="" className={styles.navButtonIcon} />
          </button>
        </>
      )}
    </section>
  );
}
