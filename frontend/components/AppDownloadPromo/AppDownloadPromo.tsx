"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAppPromo, resolveMediaUrl } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import type { AppPromoSetting } from "@/lib/types";
import styles from "./AppDownloadPromo.module.css";

// Dismissing hides it for the rest of the browser session (not forever) —
// sessionStorage, same convention as AnnouncementBar.
const DISMISSED_KEY = "shopitech-app-promo-dismissed";
const SLIDE_MS = 4000;

// Randomized once per module load (not per render) so the sparkle layout
// doesn't reshuffle on every re-render — position/size/delay/duration only
// need to look "scattered", not be driven by any real state.
const SPARKLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  top: Math.round(Math.random() * 100),
  left: Math.round(Math.random() * 100),
  size: 8 + Math.round(Math.random() * 10),
  delay: (Math.random() * 3).toFixed(2),
  duration: (2 + Math.random() * 1.5).toFixed(2),
}));

// Same pages WhatsAppButton/SupportButton hide on, plus checkout — a promo
// widget has no business distracting someone mid-payment.
function isHiddenOnPathname(pathname: string | null): boolean {
  return pathname != null && /\/(connexion|inscription|checkout)/.test(pathname);
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function AppDownloadPromo() {
  const dict = useDictionary();
  const pathname = usePathname();
  const [promo, setPromo] = useState<AppPromoSetting | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    getAppPromo().then(setPromo).catch(() => {});
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
  }, []);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const images = promo?.images ?? [];
  // Slide 0 is always the app-download message — a permanent first slide,
  // not something admin-added images replace. Any images the admin adds are
  // extra slides appended after it, each free to be its own self-contained
  // announcement graphic (the image itself carries whatever it needs to
  // say — no separate caption from this component).
  const slideCount = 1 + images.length;

  useEffect(() => {
    if (slideCount < 2) return;
    const timer = window.setInterval(() => setSlide((i) => (i + 1) % slideCount), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slideCount]);

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  }

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    }
    dismiss();
  }

  if (!promo?.is_active || dismissed || isHiddenOnPathname(pathname)) return null;

  return (
    <div className={styles.wrapper} role="complementary" aria-label={dict.appPromo.title}>
      <div className={styles.card}>
        {SPARKLES.map((s) => (
          <span
            key={s.id}
            className={styles.sparkle}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          >
            <SparkleIcon />
          </span>
        ))}

        <button type="button" className={styles.closeButton} aria-label={dict.appPromo.close} onClick={dismiss}>
          <CloseIcon />
        </button>

        <div className={styles.viewport}>
          <div className={styles.track} style={{ transform: `translateX(-${slide * 100}%)` }}>
            <div className={styles.slide}>
              <div className={styles.defaultContent}>
                <span className={styles.phoneIcon} aria-hidden="true">
                  <PhoneIcon />
                </span>

                <div className={styles.text}>
                  <p className={styles.kicker}>{dict.appPromo.kicker}</p>
                  <p className={styles.title}>{dict.appPromo.title}</p>
                  <p className={styles.highlightLine}>
                    <span className={styles.highlight}>{dict.appPromo.highlight}</span>
                    <span className={styles.suffix}> {dict.appPromo.suffix}</span>
                  </p>

                  <button type="button" className={styles.cta} onClick={handleInstall}>
                    {dict.appPromo.cta}
                  </button>
                </div>
              </div>
            </div>

            {images.map((img) => (
              <div key={img.id} className={styles.slide}>
                <img src={resolveMediaUrl(img.image)} alt="" className={styles.slideImage} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c.7 4.9 2.1 8.4 4.2 10.5C18.4 12.6 21.4 14 24 14.4c-2.6.4-5.6 1.8-7.8 3.9-2.1 2.1-3.5 5.6-4.2 10.5-.7-4.9-2.1-8.4-4.2-10.5C5.6 16.2 2.6 14.8 0 14.4c2.6-.4 5.6-1.8 7.8-3.9C9.9 8.4 11.3 4.9 12 0Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <line x1="6" y1="18" x2="18" y2="18" />
      <circle cx="12" cy="19.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}
