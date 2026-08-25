"use client";

import { useEffect, useState } from "react";
import styles from "./AdBannerCarousel.module.css";

type Transition = "fade" | "reel" | "slide";

interface Slide {
  src: string;
  transition: Transition;
}

// Hardcoded, like the ad-column slots themselves (see HeroSection's own
// comment) — there's no admin/CMS wiring for this slot yet. Each slide
// carries its own entrance style rather than one shared transition: the
// 2nd slide rolls in like a slot-machine reel, the 3rd slides in from the
// left — see the matching .enterReel/.enterSlide keyframes below.
const SLIDES: Slide[] = [
  { src: "/images/bann2.webp", transition: "fade" },
  { src: "/images/bann3.jpg", transition: "reel" },
  { src: "/images/bann4.jpg", transition: "slide" },
];

const SLIDE_MS = 4500;

const TRANSITION_CLASS: Record<Transition, string> = {
  fade: styles.enterFade,
  reel: styles.enterReel,
  slide: styles.enterSlide,
};

export default function AdBannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (SLIDES.length <= 1) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <div className={styles.frame}>
      {/* key={index} forces a remount on every advance, which is what makes
          the entrance keyframe actually replay instead of the src just
          swapping in place. */}
      <img key={index} src={slide.src} alt="" className={`${styles.image} ${TRANSITION_CLASS[slide.transition]}`} />
    </div>
  );
}
