"use client";

import { useEffect, useRef, useState } from "react";
import { fireConfetti } from "@/lib/confetti";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { productPath } from "@/lib/productUrl";
import type { Product } from "@/lib/types";
import styles from "./MysteryBoxCard.module.css";

const VIEWER_MIN = 9;
const VIEWER_MAX = 34;
const VIEWER_TICK_MS = 4000;
const MAX_TILT_DEG = 10;
// Delays the actual navigation just long enough for the confetti burst
// (see handleClick) to be visible before the page moves on — matches the
// brief's "avant même que la page ne se recharge".
const NAVIGATE_DELAY_MS = 220;

interface Particle {
  id: number;
  left: number;
  delay: string;
}

// Fixed, non-random — used for both the server render and the client's
// first (pre-hydration) render, which must match exactly. Randomizing this
// at module scope (as it was originally) runs once on the server and again
// when the client re-evaluates the module, producing different left/delay
// values each time — a hydration mismatch, even though the particles are
// only ever visible on :hover (React still diffs the initial markup
// regardless of what's visually relevant). The real randomized positions
// are only assigned client-side, after mount — see the useState below.
const BASE_PARTICLES: Particle[] = [
  { id: 0, left: 20, delay: "0.00" },
  { id: 1, left: 35, delay: "0.10" },
  { id: 2, left: 50, delay: "0.20" },
  { id: 3, left: 65, delay: "0.30" },
  { id: 4, left: 78, delay: "0.15" },
  { id: 5, left: 44, delay: "0.25" },
];

function randomizeParticles(): Particle[] {
  return BASE_PARTICLES.map((p) => ({
    ...p,
    left: 15 + Math.round(Math.random() * 70),
    delay: (Math.random() * 0.5).toFixed(2),
  }));
}

// This is a simulated counter, not a real analytics feed — there's no
// "viewers on this card" metric anywhere in the backend. It random-walks
// within a plausible range every few seconds rather than jumping around
// erratically, so it still reads as a believable live number.
function nextViewerCount(current: number): number {
  const delta = Math.round((Math.random() - 0.5) * 6);
  return Math.min(VIEWER_MAX, Math.max(VIEWER_MIN, current + delta));
}

interface MysteryBoxCardProps {
  /** Admin-picked (see Admin\HomepageAdSettingController) — when set, the
   *  whole card links to this real product's page instead of the generic
   *  catalog anchor. Optional on purpose: the card still works, just less
   *  specifically, before an admin ever picks one. */
  product: Product | null;
}

export default function MysteryBoxCard({ product }: MysteryBoxCardProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const href = product ? productPath(product) : "#catalogue";
  const boxRef = useRef<HTMLImageElement>(null);
  const [viewerCount, setViewerCount] = useState(18);
  const [particles, setParticles] = useState(BASE_PARTICLES);

  useEffect(() => {
    const timer = window.setInterval(() => setViewerCount(nextViewerCount), VIEWER_TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setParticles(randomizeParticles());
  }, []);

  function handleBoxPointerMove(e: React.PointerEvent) {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * MAX_TILT_DEG * 2;
    const rotateX = (0.5 - py) * MAX_TILT_DEG * 2;
    box.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    box.style.setProperty("--gold-x", `${px * 100}%`);
    box.style.setProperty("--gold-y", `${py * 100}%`);
  }

  function resetBoxTilt() {
    boxRef.current?.style.setProperty("transform", "perspective(600px) rotateX(0deg) rotateY(0deg)");
  }

  // Fires the confetti burst before navigating (rather than letting the
  // link navigate immediately) — see NAVIGATE_DELAY_MS.
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    fireConfetti({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    window.setTimeout(() => router.push(href), NAVIGATE_DELAY_MS);
  }

  return (
    <LocaleLink href={href} onClick={handleClick} className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.content}>
          <p className={styles.title}>{dict.home.adMysteryBox.title}</p>
          <p className={styles.price}>{dict.home.adMysteryBox.price}</p>
          <p className={styles.social}>🔥 {dict.home.adMysteryBox.viewers(viewerCount)}</p>
          <span className={styles.cta}>
            {dict.home.adMysteryBox.cta} <span aria-hidden="true">🎲</span>
          </span>
        </div>
      </div>

      {/* Pops out above .card's clipped top edge on purpose (position:
          absolute, negative top — same "spills past its own frame"
          convention as HeroBanner's imageWrapper) — the box art (real photo
          now, see misteri_box.png) physically overflows the card. */}
      <div className={styles.boxStage} onPointerMove={handleBoxPointerMove} onPointerLeave={resetBoxTilt}>
        <span className={styles.glow} aria-hidden="true" />
        <div className={styles.boxShadow} aria-hidden="true" />

        <img
          ref={boxRef}
          src="/images/hero/misteri_box.png"
          alt=""
          draggable={false}
          className={styles.box}
        />
        <span className={styles.goldSheen} aria-hidden="true" />

        <div className={styles.particles} aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className={styles.particle}
              style={{ left: `${p.left}%`, animationDelay: `${p.delay}s` }}
            >
              ✨
            </span>
          ))}
        </div>
      </div>
    </LocaleLink>
  );
}
