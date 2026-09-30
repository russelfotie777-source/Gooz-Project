"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { productPath } from "@/lib/productUrl";
import type { Product } from "@/lib/types";
import styles from "./FlashSacrificeCard.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

// There's no real "promotion end date" anywhere in the backend (sale
// pricing is just a per-variant is_promotion flag — see
// ProductVariant::effectivePrice()), so this counts down to the next local
// midnight rather than any specific promotion's actual end, framed as a
// recurring daily flash-sale window. Recomputed fresh every tick instead of
// fixed once, so it naturally rolls over at midnight with no special-case
// reset logic.
function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

interface FlashSacrificeCardProps {
  /** The item teased behind the silhouette, and what "SÉCURISER MON
   *  EXEMPLAIRE" links to — a real product (preferring one on promotion),
   *  not a made-up placeholder, so the reveal is never a bait-and-switch. */
  product: Product;
}

export default function FlashSacrificeCard({ product }: FlashSacrificeCardProps) {
  const dict = useDictionary();
  // Starts null (not msUntilMidnight()) so server and client render the
  // exact same placeholder on first paint — see the identical note this
  // pattern was originally written for (AdCountdownCard, now this).
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(msUntilMidnight());
    const timer = window.setInterval(() => setRemaining(msUntilMidnight()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = remaining === null ? 0 : Math.max(0, Math.floor(remaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
  const imageSrc = primaryImage?.thumbnail_url ?? primaryImage?.image_url ?? PLACEHOLDER_IMAGE;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} aria-hidden="true" />
          {dict.home.adFlash.badgeLive}
        </span>

        {/* Dimmed rather than a flat silhouette on purpose: this is a real
            product photo (opaque background, no cutout/alpha), so a true
            shape-only silhouette isn't achievable from it — brightness(0)
            on a non-transparent photo just turns into a solid black
            rectangle, not a recognizable outline. Dimmed-but-visible is the
            honest middle ground: still a tease, still reveals a believable
            shape/colors on hover. */}
        <LocaleLink href={productPath(product)} className={styles.silhouette} aria-label={product.name}>
          <Image src={imageSrc} alt="" fill sizes="60px" className={styles.silhouetteImage} />
          <span className={styles.flash} aria-hidden="true" />
        </LocaleLink>
      </div>

      <p className={styles.title}>{dict.home.adFlash.title}</p>

      <div className={styles.digits} aria-hidden="true">
        <span className={styles.digitBox}>{pad(hours)}</span>
        <span className={styles.separator}>:</span>
        <span className={styles.digitBox}>{pad(minutes)}</span>
        <span className={styles.separator}>:</span>
        <span className={styles.digitBox}>{pad(seconds)}</span>
      </div>

      <LocaleLink href={productPath(product)} className={styles.cta}>
        {dict.home.adFlash.cta}
        <span className={styles.ctaArrow} aria-hidden="true">
          ➔
        </span>
      </LocaleLink>
    </div>
  );
}
