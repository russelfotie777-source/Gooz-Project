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

// Real banners (managed in the admin, backend already supports scheduling +
// product/external links — see BannerController) now drive this carousel.
// With none active, it falls back to the original static slide, but WITHOUT
// the prev/next/dots — those used to render unconditionally with no handler
// wired to them at all, which is the actual bug: controls for slides that
// never existed.
export default function HeroBanner({ banners }: HeroBannerProps) {
  const dict = useDictionary();
  const [index, setIndex] = useState(0);
  const slideCount = banners.length;
  const hasMultipleSlides = slideCount > 1;

  useEffect(() => {
    setIndex(0);
  }, [banners]);

  useEffect(() => {
    if (!hasMultipleSlides) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slideCount), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [hasMultipleSlides, slideCount]);

  function goTo(target: number) {
    setIndex(((target % slideCount) + slideCount) % slideCount);
  }

  const banner = banners[index] ?? null;

  return (
    <section
      className={`${styles.banner} ${banner ? styles.bannerWithImage : ""}`}
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

          <div className={styles.imageWrapper} aria-hidden="true">
            <div className={styles.circleWrapper}>
              <img src="/images/hero/circle-decoration.svg" alt="" className={styles.circleDecoration} />
            </div>
            <img src="/images/hero/product-camera.png" alt="" className={styles.productImage} />
          </div>
        </>
      )}

      {hasMultipleSlides && (
        <>
          <div className={styles.dots}>
            {banners.map((b, i) => (
              <button
                key={b.id}
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
