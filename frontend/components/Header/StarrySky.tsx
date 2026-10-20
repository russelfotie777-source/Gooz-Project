"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./StarrySky.module.css";

// Renders behind the mobile catalogue header's title/search content (see
// Header.module.css's .mobileCatalogueSticky) to back up "reproduce a
// starry sky" with something that actually reads as one:
// - dozens of small dust stars, each twinkling on its own desynced
//   schedule (not one shared pan of the whole field — that reads as the
//   background sliding, not as individual stars flickering)
// - a handful of bigger 4-point "anchor" stars so the eye has somewhere to
//   land, instead of everything being the same size
// - an occasional shooting star with a real tapered tail, whose path,
//   angle and timing are re-rolled in JS each time (a pure-CSS keyframe
//   would retrace the exact same line on every loop and start feeling
//   mechanical within a couple of cycles)
// Still no canvas/WebGL: every star is a tiny absolutely-positioned
// element animated with CSS (opacity/top/left), which is cheap enough that
// a few dozen of them cost nothing noticeable.

interface DustStar {
  id: number;
  x: number; // %
  y: number; // %
  size: number; // px
  peak: number; // 0-1, brightest point of its twinkle
  delay: number; // s
  duration: number; // s
}

interface AnchorStar {
  id: number;
  x: number;
  y: number;
  size: number; // px, the rendered SVG's width/height
  delay: number;
  duration: number;
}

// Hand-placed, not generated — deterministic so server and client render
// the exact same markup (no hydration mismatch), spread across the FULL
// height (including the lower half, near the search bar) instead of
// clustering in the top half the way the field-of-view-sized gradient
// version did.
const DUST_STARS: DustStar[] = [
  { id: 1, x: 4, y: 8, size: 1.4, peak: 0.9, delay: 0.2, duration: 3.2 },
  { id: 2, x: 11, y: 34, size: 1.1, peak: 0.7, delay: 1.4, duration: 2.8 },
  { id: 3, x: 18, y: 62, size: 1.3, peak: 0.8, delay: 0.6, duration: 3.6 },
  { id: 4, x: 23, y: 15, size: 1.0, peak: 0.6, delay: 2.1, duration: 2.4 },
  { id: 5, x: 29, y: 48, size: 1.5, peak: 0.85, delay: 0.9, duration: 3.0 },
  { id: 6, x: 34, y: 79, size: 1.1, peak: 0.65, delay: 1.8, duration: 2.6 },
  { id: 7, x: 38, y: 5, size: 1.2, peak: 0.75, delay: 0.3, duration: 3.4 },
  { id: 8, x: 44, y: 36, size: 1.0, peak: 0.6, delay: 2.4, duration: 2.9 },
  { id: 9, x: 49, y: 68, size: 1.4, peak: 0.8, delay: 1.1, duration: 3.3 },
  { id: 10, x: 53, y: 22, size: 1.1, peak: 0.7, delay: 0.5, duration: 2.7 },
  { id: 11, x: 58, y: 88, size: 1.2, peak: 0.75, delay: 1.6, duration: 3.1 },
  { id: 12, x: 62, y: 44, size: 1.0, peak: 0.6, delay: 2.7, duration: 2.5 },
  { id: 13, x: 67, y: 12, size: 1.5, peak: 0.85, delay: 0.1, duration: 3.5 },
  { id: 14, x: 71, y: 58, size: 1.1, peak: 0.65, delay: 1.3, duration: 2.8 },
  { id: 15, x: 76, y: 30, size: 1.3, peak: 0.8, delay: 0.8, duration: 3.2 },
  { id: 16, x: 80, y: 74, size: 1.0, peak: 0.6, delay: 2.0, duration: 2.6 },
  { id: 17, x: 84, y: 18, size: 1.2, peak: 0.7, delay: 0.4, duration: 3.0 },
  { id: 18, x: 88, y: 52, size: 1.4, peak: 0.85, delay: 1.9, duration: 3.4 },
  { id: 19, x: 92, y: 8, size: 1.1, peak: 0.65, delay: 1.2, duration: 2.7 },
  { id: 20, x: 95, y: 40, size: 1.0, peak: 0.6, delay: 0.7, duration: 2.9 },
  { id: 21, x: 7, y: 92, size: 1.2, peak: 0.7, delay: 2.3, duration: 3.1 },
  { id: 22, x: 41, y: 90, size: 1.1, peak: 0.65, delay: 1.5, duration: 2.8 },
  { id: 23, x: 64, y: 95, size: 1.3, peak: 0.75, delay: 0.3, duration: 3.3 },
  { id: 24, x: 97, y: 82, size: 1.0, peak: 0.6, delay: 1.0, duration: 2.6 },
];

const ANCHOR_STARS: AnchorStar[] = [
  { id: 1, x: 15, y: 20, size: 11, delay: 0.5, duration: 4.0 },
  { id: 2, x: 48, y: 58, size: 12, delay: 2.0, duration: 4.6 },
  { id: 3, x: 78, y: 10, size: 10, delay: 1.2, duration: 3.8 },
  { id: 4, x: 30, y: 85, size: 11, delay: 0.8, duration: 4.2 },
  { id: 5, x: 88, y: 65, size: 10, delay: 1.8, duration: 4.4 },
];

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
  length: number;
  duration: number;
}

function randomShootingStar(id: number): ShootingStar {
  const startX = 5 + Math.random() * 45;
  const startY = 4 + Math.random() * 45;
  const endX = startX + 30 + Math.random() * 35;
  const endY = startY + 22 + Math.random() * 28;
  const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;
  return {
    id,
    startX,
    startY,
    endX: Math.min(endX, 110),
    endY: Math.min(endY, 105),
    angle,
    length: 60 + Math.random() * 45,
    duration: 1000 + Math.random() * 600,
  };
}

export default function StarrySky() {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timeoutId: number;

    function scheduleNext() {
      // 4-10s between occurrences — frequent enough to notice over a
      // normal browsing session, rare enough to still feel like a moment
      // rather than a loop.
      const delay = 4000 + Math.random() * 6000;
      timeoutId = window.setTimeout(() => {
        const star = randomShootingStar(nextId.current++);
        setShootingStars((prev) => [...prev, star]);
        window.setTimeout(() => {
          setShootingStars((prev) => prev.filter((s) => s.id !== star.id));
        }, star.duration + 200);
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className={styles.sky} aria-hidden="true">
      {DUST_STARS.map((s) => (
        <span
          key={s.id}
          className={styles.dustStar}
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
              "--peak": s.peak,
            } as React.CSSProperties
          }
        />
      ))}

      {ANCHOR_STARS.map((s) => (
        <svg
          key={s.id}
          viewBox="0 0 20 20"
          className={styles.anchorStar}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <path d="M10 0C10 6 14 10 20 10 14 10 10 14 10 20 10 14 6 10 0 10 6 10 10 6 10 0Z" fill="#ffffff" />
        </svg>
      ))}

      {shootingStars.map((s) => (
        <span
          key={s.id}
          className={styles.shootingStar}
          style={
            {
              width: `${s.length}px`,
              transform: `rotate(${s.angle}deg)`,
              animationDuration: `${s.duration}ms`,
              "--start-x": `${s.startX}%`,
              "--start-y": `${s.startY}%`,
              "--end-x": `${s.endX}%`,
              "--end-y": `${s.endY}%`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
