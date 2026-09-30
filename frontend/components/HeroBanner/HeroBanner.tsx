"use client";

import { useEffect, useRef, useState } from "react";
import { resolveMediaUrl } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { productPath } from "@/lib/productUrl";
import { sampleEdgeColor } from "@/lib/sampleEdgeColor";
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

// The fallback slide's decorative product photo isn't fixed to a single
// image anymore — it swipes/autoplays between these, independently of the
// outer banner carousel above (that one crossfades whole slides; this one
// only swaps the photo, text/CTA stay put).
const PRODUCT_IMAGES = ["/images/hero/product-camera.png", "/images/hero/blender.png"];
const PRODUCT_IMAGE_AUTOPLAY_MS = 4000;
const SWIPE_THRESHOLD_PX = 40;
// Duration of each half of the "door" flip (outgoing image rotating to
// edge-on, then the incoming one rotating in from the opposite edge) — see
// the productPhase state machine below. Kept short: this plays on every
// autoplay tick, so it needs to read as a flourish, not a wait.
const PRODUCT_FLIP_HALF_MS = 280;

// Every image except PRODUCT_IMAGES[0] (the camera, which keeps its own
// static circle-decoration.svg — see circleWrapper below) gets this instead:
// a halo sampled from its own edges, a ground grid tinted with that same
// color, and a mirrored reflection — all three driven off one sampled
// color so it reads as one scene, not three effects stacked on top of
// each other. Shown before the real color is known and if sampling fails.
const FALLBACK_PRODUCT_HALO = "rgba(255, 149, 0, 0.35)";

type ProductPhase = "idle" | "closing" | "openingStart" | "openingEnd";

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
  const [productImageIndex, setProductImageIndex] = useState(0);
  // productDisplayIndex/productPhase mirror the outer index/displayIndex/
  // fading pattern above, but drive a 3D door-flip (rotateY) instead of an
  // opacity crossfade — see the effect below for the 4-step sequence.
  const [productDisplayIndex, setProductDisplayIndex] = useState(0);
  const [productPhase, setProductPhase] = useState<ProductPhase>("idle");
  const [productHaloColor, setProductHaloColor] = useState(FALLBACK_PRODUCT_HALO);
  const productFlipTimers = useRef<number[]>([]);
  const productFlipRafs = useRef<number[]>([]);
  const productSwipeStartX = useRef(0);
  const productSwipeActive = useRef(false);
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

  useEffect(() => {
    if (banner || PRODUCT_IMAGES.length <= 1) return;
    const timer = window.setInterval(
      () => setProductImageIndex((i) => (i + 1) % PRODUCT_IMAGES.length),
      PRODUCT_IMAGE_AUTOPLAY_MS,
    );
    return () => window.clearInterval(timer);
  }, [banner]);

  // Drives the door-flip in 4 steps whenever productImageIndex (the target,
  // set by autoplay/swipe below) moves away from productDisplayIndex (what's
  // actually rendered):
  //   1. "closing"     — the displayed image transitions 0deg -> 90deg
  //                       (CSS transition; it visually vanishes edge-on).
  //   2. "openingStart"— swap productDisplayIndex to the target image, and
  //                       render it instantly (no transition) at -90deg —
  //                       the opposite edge, ready to swing in.
  //   3. "openingEnd"  — one paint later (double rAF, so the -90deg frame
  //                       actually commits first), transition it -90 -> 0.
  //   4. "idle"        — hand off to the idle turntable keyframe animation,
  //                       which starts from 0deg so there's no visible jump.
  useEffect(() => {
    if (productImageIndex === productDisplayIndex) return;

    productFlipTimers.current.forEach((id) => window.clearTimeout(id));
    productFlipTimers.current = [];
    productFlipRafs.current.forEach((id) => cancelAnimationFrame(id));
    productFlipRafs.current = [];

    setProductPhase("closing");

    const closeTimer = window.setTimeout(() => {
      setProductDisplayIndex(productImageIndex);
      setProductPhase("openingStart");

      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setProductPhase("openingEnd"));
        productFlipRafs.current.push(raf2);
      });
      productFlipRafs.current.push(raf1);

      const openTimer = window.setTimeout(() => setProductPhase("idle"), PRODUCT_FLIP_HALF_MS);
      productFlipTimers.current.push(openTimer);
    }, PRODUCT_FLIP_HALF_MS);
    productFlipTimers.current.push(closeTimer);

    return () => {
      productFlipTimers.current.forEach((id) => window.clearTimeout(id));
      productFlipTimers.current = [];
      productFlipRafs.current.forEach((id) => cancelAnimationFrame(id));
      productFlipRafs.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productImageIndex]);

  // Only sampled/used for non-camera images (index 0 keeps its own static
  // decoration, see circleWrapper) — no point paying for a fetch+decode the
  // camera slide will never render.
  useEffect(() => {
    if (productDisplayIndex === 0) return;
    // These are local /public files (not backend-served storage), so unlike
    // ProductAdBanner's use of this same helper, the path is passed as-is —
    // resolveMediaUrl would incorrectly prefix it with the backend origin.
    let cancelled = false;
    sampleEdgeColor(PRODUCT_IMAGES[productDisplayIndex]).then((color) => {
      if (!cancelled && color) setProductHaloColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [productDisplayIndex]);

  // Shared by circleWrapper (camera only) and productExtras (every other
  // image) — both fade in/out on the same 4-step schedule as the product
  // image itself, just gated by a different "is this my image?" condition.
  function phaseVisibilityClass(active: boolean): string {
    if (!active) return "";
    if (productPhase === "closing") return styles.phaseClosing;
    if (productPhase === "openingStart") return styles.phaseOpeningStart;
    if (productPhase === "openingEnd") return styles.phaseOpeningEnd;
    return styles.phaseVisible;
  }

  function handleProductPointerDown(e: React.PointerEvent) {
    productSwipeStartX.current = e.clientX;
    productSwipeActive.current = true;
  }

  function handleProductPointerUp(e: React.PointerEvent) {
    if (!productSwipeActive.current) return;
    productSwipeActive.current = false;
    const deltaX = e.clientX - productSwipeStartX.current;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    setProductImageIndex((i) => {
      const next = i + (deltaX < 0 ? 1 : -1);
      return (next + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length;
    });
  }

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
          banner.show_overlay ? (
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
            // The creative already has its own text/CTA baked in — no
            // scrim, no title/description block. The whole slide just
            // becomes a click target (title kept as the accessible label
            // since there's no visible heading for it here).
            (banner.link_type === "product" && banner.product && (
              <LocaleLink href={productPath(banner.product)} className={styles.fullLink} aria-label={banner.title} />
            )) ||
            (banner.link_url && (
              <a
                href={banner.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fullLink}
                aria-label={banner.title}
              />
            ))
          )
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
            <div
              className={styles.imageWrapper}
              aria-hidden="true"
              onPointerDown={handleProductPointerDown}
              onPointerUp={handleProductPointerUp}
              onPointerCancel={() => {
                productSwipeActive.current = false;
              }}
            >
              {/* Every image except the camera (index 0): a grid tinted with
                  that image's own sampled color behind it, plus its halo —
                  one color, two effects, faded in/out on the same schedule
                  as everything else here. The camera never gets this; it
                  keeps circleWrapper below instead. */}
              <div
                className={`${styles.productExtras} ${phaseVisibilityClass(productDisplayIndex !== 0)}`}
                style={{ "--product-halo-color": productHaloColor } as React.CSSProperties}
              >
                <div className={styles.productGrid} />
                <div className={styles.productHalo} />
              </div>

              {/* Tied to the camera specifically (PRODUCT_IMAGES[0]), not to
                  "an image is showing" in general — fades out in step with
                  the camera closing away, and back in as it opens into
                  view, so it never lingers behind the blender. */}
              <div className={`${styles.circleWrapper} ${phaseVisibilityClass(productDisplayIndex === 0)}`}>
                <img src="/images/hero/circle-decoration.svg" alt="" className={styles.circleDecoration} />
              </div>

              <div
                className={`${styles.productShadow} ${
                  productPhase === "closing"
                    ? styles.productShadowSquish
                    : productPhase === "openingStart"
                      ? styles.productShadowSquishInstant
                      : productPhase === "openingEnd"
                        ? styles.productShadowRelax
                        : styles.productShadowIdle
                }`}
              />

              {PRODUCT_IMAGES.map((src, i) => {
                const isDisplayed = i === productDisplayIndex;
                let phaseClass = "";
                if (isDisplayed) {
                  if (productPhase === "idle") phaseClass = styles.productImageActive;
                  else if (productPhase === "closing") phaseClass = styles.productImageClosing;
                  else if (productPhase === "openingStart") phaseClass = styles.productImageOpeningStart;
                  else if (productPhase === "openingEnd") phaseClass = styles.productImageOpeningEnd;
                }
                return <img key={src} src={src} alt="" draggable={false} className={`${styles.productImage} ${phaseClass}`} />;
              })}
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
