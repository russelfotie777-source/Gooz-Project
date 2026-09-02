"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Announcement } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./AnnouncementBar.module.css";

interface AnnouncementBarProps {
  announcements: Announcement[];
  dismissed: boolean;
  variant: "desktop" | "mobile";
  onDismiss: () => void;
}

// Sentinel id, well outside the real DB's id range — this slide never comes
// from the API, so it can't collide with one that does.
const BRAND_SLIDE_ID = -1;

const MIN_SLIDE_MS = 2600;
const MAX_SLIDE_MS = 5500;
// How long the outgoing slide gets to animate away before the incoming one
// takes its place — see the exiting/entering dance below.
const EXIT_MS = 180;

// Longer messages get more time on screen instead of everyone racing
// through the same fixed duration regardless of how much there is to read.
function slideDurationMs(text: string): number {
  return Math.min(MAX_SLIDE_MS, Math.max(MIN_SLIDE_MS, 1300 + text.length * 35));
}

// A simple "-20%"/"20 %" style discount, pulled out into its own pill so it
// scans at a glance — deliberately narrow (just a percentage) rather than
// trying to also guess at promo codes, which is too fuzzy to do reliably
// against free-text admin content.
const PROMO_PATTERN = /-?\d{1,3}\s?%/;

// Fixed set of little bursts (direction + color + stagger) replayed at each
// edge on every slide change. Kept short on purpose — the cluster now starts
// further in from the edge (see .confettiClusterLeft/Right) and these travel
// distances stay well inside that margin, so the burst stays inside the
// bar's clipped area instead of flying straight past it.
const CONFETTI_PIECES = [
  { tx: -12, ty: -13, color: "#fcd116", delay: 0 },
  { tx: -6, ty: -17, color: "#ffffff", delay: 40 },
  { tx: -14, ty: 2, color: "#ff9500", delay: 90 },
  { tx: -5, ty: 15, color: "#ce1126", delay: 130 },
  { tx: -13, ty: 12, color: "#007a5e", delay: 20 },
  { tx: -8, ty: -3, color: "#fcd116", delay: 110 },
];

// Fills the .promoStrip/.mobilePromoStrip slot in Header — see that
// component's comments. The brand slide below is hardcoded on purpose (per
// the user's request): it's always the first slide, guaranteeing the bar is
// never empty even with zero announcements configured in the admin — those
// just rotate in right after it, same carousel, same timer.
export default function AnnouncementBar({ announcements, dismissed, variant, onDismiss }: AnnouncementBarProps) {
  const dict = useDictionary();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [marqueeDistance, setMarqueeDistance] = useState(0);
  const textRef = useRef<HTMLSpanElement>(null);

  const brandSlide: Announcement = useMemo(
    () => ({
      id: BRAND_SLIDE_ID,
      text: dict.header.announcementBrand,
      icon: "🇨🇲",
      link_url: null,
      position: -1,
    }),
    [dict.header.announcementBrand]
  );

  const slides = useMemo(() => [brandSlide, ...announcements], [brandSlide, announcements]);
  const count = slides.length;

  useEffect(() => {
    setIndex(0);
    setExiting(false);
  }, [announcements]);

  const announcement = slides[index % count];

  function advance(direction: 1 | -1) {
    if (count <= 1) return;
    setExiting(true);
    window.setTimeout(() => {
      setIndex((i) => (i + direction + count) % count);
      setExiting(false);
    }, EXIT_MS);
  }

  // Auto-advance: each slide gets its own duration (see slideDurationMs),
  // paused on hover/focus, and stands down entirely while a manual
  // exit/enter transition (see advance()) is already in flight.
  useEffect(() => {
    if (count <= 1 || paused || exiting) return;
    const duration = slideDurationMs(announcement.text);
    const timer = window.setTimeout(() => advance(1), duration);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, paused, exiting, index]);

  // Only relevant while paused (hovered/focused) — that's when the marquee
  // in the render below actually gets to run, so there's no point measuring
  // otherwise.
  useEffect(() => {
    const el = textRef.current;
    if (!el) {
      setMarqueeDistance(0);
      return;
    }
    const overflow = el.scrollWidth - el.clientWidth;
    setMarqueeDistance(overflow > 4 ? overflow : 0);
  }, [announcement.text, index]);

  if (dismissed) return null;

  const barClassName = variant === "desktop" ? styles.bar : styles.barMobile;
  const isBrandSlide = announcement.id === BRAND_SLIDE_ID;
  const promoMatch = announcement.text.match(PROMO_PATTERN);
  const showNav = variant === "desktop" && count > 1;

  const slideBody = (
    <span
      key={exiting ? `exit-${index}` : `enter-${index}`}
      className={`${styles.slideContent} ${exiting ? styles.slideExit : styles.slideEnter}`}
    >
      {(isBrandSlide || announcement.icon) && (
        <span className={styles.iconBadge} aria-hidden="true">
          {isBrandSlide ? <CameroonFlagIcon className={styles.flagIcon} /> : announcement.icon}
        </span>
      )}

      {promoMatch && <span className={styles.promoPill}>{promoMatch[0].trim()}</span>}

      {marqueeDistance > 0 && paused ? (
        <span className={styles.textClip}>
          <span
            className={styles.textMarqueeInner}
            style={{ "--marquee-distance": `${marqueeDistance}px` } as React.CSSProperties}
          >
            {announcement.text}
          </span>
        </span>
      ) : (
        <span ref={textRef} className={styles.text}>
          {announcement.text}
        </span>
      )}

      {announcement.link_url && (
        <span className={styles.linkArrow} aria-hidden="true">
          ↗
        </span>
      )}
    </span>
  );

  return (
    <div
      className={barClassName}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span key={`glow-${index}`} className={styles.glowPulse} aria-hidden="true" />
      <ConfettiBurst key={`confetti-left-${index}`} side="left" />
      <ConfettiBurst key={`confetti-right-${index}`} side="right" />

      {showNav && (
        <button
          type="button"
          className={styles.navButton}
          onClick={() => advance(-1)}
          aria-label={dict.common.previous}
        >
          ‹
        </button>
      )}

      {announcement.link_url ? (
        <a href={announcement.link_url} target="_blank" rel="noopener noreferrer" className={styles.message}>
          {slideBody}
        </a>
      ) : (
        <span className={styles.message}>{slideBody}</span>
      )}

      {showNav && (
        <button type="button" className={styles.navButton} onClick={() => advance(1)} aria-label={dict.common.next}>
          ›
        </button>
      )}

      {count > 1 && (
        <div className={styles.progressDots} aria-hidden="true">
          {slides.map((slide, i) => (
            <span key={`${slide.id}-${i}`} className={styles.progressDot}>
              {i === index ? (
                <span
                  key={exiting ? `exit-${index}` : `enter-${index}`}
                  className={styles.progressFillActive}
                  style={{
                    animationDuration: `${slideDurationMs(slide.text)}ms`,
                    animationPlayState: paused || exiting ? "paused" : "running",
                  }}
                />
              ) : (
                <span className={i < index ? styles.progressFillComplete : styles.progressFillIdle} />
              )}
            </span>
          ))}
        </div>
      )}

      <button type="button" className={styles.dismissButton} onClick={onDismiss} aria-label={dict.common.close}>
        ×
      </button>
    </div>
  );
}

// A little firework/confetti pop at each edge, replayed (via the key the
// caller passes) every time the carousel lands on a new slide — same timing
// as the border glow, so the two read as one "landing" moment rather than
// two unrelated effects.
function ConfettiBurst({ side }: { side: "left" | "right" }) {
  return (
    <span
      className={`${styles.confettiCluster} ${side === "left" ? styles.confettiClusterLeft : styles.confettiClusterRight}`}
      aria-hidden="true"
    >
      {CONFETTI_PIECES.map((piece, i) => (
        <span
          key={i}
          className={styles.confettiPiece}
          style={
            {
              "--tx": `${side === "left" ? -Math.abs(piece.tx) : Math.abs(piece.tx)}px`,
              "--ty": `${piece.ty}px`,
              "--piece-color": piece.color,
              animationDelay: `${piece.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

function CameroonFlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <clipPath id="announcement-flag-clip">
        <circle cx="16" cy="16" r="16" />
      </clipPath>
      <g clipPath="url(#announcement-flag-clip)">
        <rect x="0" y="0" width="10.67" height="32" fill="#007a5e" />
        <rect x="10.67" y="0" width="10.67" height="32" fill="#ce1126" />
        <rect x="21.33" y="0" width="10.67" height="32" fill="#fcd116" />
        <polygon
          points="16,12.2 17.05,15.2 20.2,15.2 17.6,17.05 18.6,20.1 16,18.2 13.4,20.1 14.4,17.05 11.8,15.2 14.95,15.2"
          fill="#fcd116"
        />
      </g>
    </svg>
  );
}
