"use client";

import { useEffect, useRef, useState } from "react";
import { resolveMediaUrl } from "@/lib/api";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { productPath } from "@/lib/productUrl";
import { sampleEdgeColor } from "@/lib/sampleEdgeColor";
import type { Banner } from "@/lib/types";
import styles from "./ProductAdBanner.module.css";

interface ProductAdBannerProps {
  /** Admin-managed (location "product" — see Admin\BannerController). As
   *  many as an admin adds; an empty list renders nothing, same as the
   *  static image this replaced. */
  banners: Banner[];
}

const AUTOPLAY_MS = 5000;
const SNAP_MS = 420;
// A drag has to cross this fraction of the viewport's width before it's
// treated as "go to the next/previous slide" rather than "snap back".
const DRAG_THRESHOLD = 0.18;
// Below this many pixels of movement, a gesture is still just a tap/click
// in progress — nothing about the carousel engages yet (see handlePointerMove).
const DRAG_ENGAGE_PX = 6;
// Shown before the real color is known (first paint) and if sampling ever
// fails — the brand accent, translucent, so it never looks broken.
const FALLBACK_HALO = "rgba(255, 149, 0, 0.35)";

function BannerSlide({ banner }: { banner: Banner }) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolveMediaUrl(banner.image)} alt={banner.title} className={styles.slideImage} draggable={false} />
  );

  if (banner.link_type === "product" && banner.product) {
    return (
      <LocaleLink href={productPath(banner.product)} className={styles.slideLink} draggable={false}>
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
        className={styles.slideLink}
        draggable={false}
      >
        {image}
      </a>
    );
  }

  return <div className={styles.slideLink}>{image}</div>;
}

// Unlike the hero carousel, this slot never crops (object-fit: cover) or
// overlays a title/scrim — per docs/dimensions-bannieres.md §5, the whole
// image is always shown at its own aspect ratio, exactly like the static
// ad-banner.jpg this replaced. show_overlay is ignored here on purpose:
// this spot was never designed to carry a site-rendered title over the
// image, so there's nothing to toggle.
//
// Two things set this apart from every other carousel on the site: an
// ambient color halo sampled from the current slide's own edges (see
// sampleEdgeColor), and a real drag/swipe interaction (not just autoplay +
// arrows) — dragging translates the track with a little resistance past
// the first/last slide, and release snaps to whichever slide is closest.
export default function ProductAdBanner({ banners }: ProductAdBannerProps) {
  const [index, setIndex] = useState(0);
  const [haloColor, setHaloColor] = useState(FALLBACK_HALO);
  const [isInteracting, setIsInteracting] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // "dragging" only becomes true once the pointer has moved past
  // DRAG_ENGAGE_PX (see handlePointerMove) — a plain tap/click never
  // crosses it, so it never touches the track, never captures the
  // pointer, and the underlying link's own click fires completely
  // untouched. "everDragged" additionally survives past pointerup just
  // long enough to swallow the click a real drag would otherwise fire on
  // release (browsers dispatch a click after pointerup regardless of how
  // far the pointer travelled in between).
  const dragging = useRef(false);
  const everDragged = useRef(false);
  const pointerId = useRef<number | null>(null);
  const dragStartX = useRef(0);
  const slideCount = banners.length;

  useEffect(() => {
    setIndex(0);
  }, [banners]);

  useEffect(() => {
    if (slideCount <= 1 || isInteracting) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slideCount), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slideCount, isInteracting]);

  // Snaps the track to `index` — used after autoplay advances, after a
  // drag crosses the threshold, and to bounce back when it doesn't.
  function settleTo(target: number) {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = `transform ${SNAP_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    track.style.transform = `translateX(-${target * 100}%)`;
  }

  useEffect(() => {
    if (dragging.current) return;
    settleTo(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const banner = banners[index];
    if (!banner) return;
    let cancelled = false;
    sampleEdgeColor(resolveMediaUrl(banner.image)).then((color) => {
      if (!cancelled && color) setHaloColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [banners, index]);

  function handlePointerDown(e: React.PointerEvent) {
    if (slideCount <= 1) return;
    // Deliberately doesn't capture the pointer or touch the track yet —
    // see the refs' comment. Only records where the gesture started.
    pointerId.current = e.pointerId;
    dragStartX.current = e.clientX;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (pointerId.current !== e.pointerId) return;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const deltaPx = e.clientX - dragStartX.current;

    if (!dragging.current) {
      if (Math.abs(deltaPx) < DRAG_ENGAGE_PX) return; // still just a tap so far
      // Crossed the engage threshold — this is a real drag now.
      dragging.current = true;
      everDragged.current = true;
      viewport.setPointerCapture(e.pointerId);
      track.style.transition = "none";
      setIsInteracting(true);
    }

    const atStart = index === 0 && deltaPx > 0;
    const atEnd = index === slideCount - 1 && deltaPx < 0;
    // Resistance once there's nowhere further to go, instead of a hard stop.
    const easedPx = atStart || atEnd ? deltaPx * 0.35 : deltaPx;
    const deltaPercent = (easedPx / viewport.clientWidth) * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${deltaPercent}%))`;
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;

    if (!dragging.current) {
      // Never crossed the engage threshold — a plain tap/click. Nothing
      // here was ever touched, so the link underneath fires its own click
      // exactly as if this component didn't exist.
      return;
    }
    dragging.current = false;

    const viewport = viewportRef.current;
    const deltaPx = viewport ? e.clientX - dragStartX.current : 0;
    const threshold = (viewport?.clientWidth ?? 0) * DRAG_THRESHOLD;

    if (deltaPx <= -threshold && index < slideCount - 1) {
      setIndex(index + 1);
    } else if (deltaPx >= threshold && index > 0) {
      setIndex(index - 1);
    } else {
      settleTo(index);
    }

    // Give autoplay a short breather after a release before resuming, not
    // just during the drag itself — an immediate resume feels like the
    // banner is yanking itself away from the shopper's hand.
    window.setTimeout(() => setIsInteracting(false), 2200);
  }

  // The browser still fires a click after pointerup regardless of how far
  // the pointer travelled — without this, a real drag-release would also
  // navigate through whatever link the pointer happened to land on.
  function handleClickCapture(e: React.MouseEvent) {
    if (everDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      everDragged.current = false;
    }
  }

  const banner = banners[index];
  if (!banner) return null;

  return (
    <div
      className={styles.wrapper}
      style={{ "--halo-color": haloColor } as React.CSSProperties}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => !dragging.current && setIsInteracting(false)}
    >
      <div className={styles.halo} aria-hidden="true" />

      <div
        ref={viewportRef}
        className={styles.viewport}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        <div ref={trackRef} className={styles.track}>
          {banners.map((b) => (
            <div className={styles.slide} key={b.id}>
              <BannerSlide banner={b} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
