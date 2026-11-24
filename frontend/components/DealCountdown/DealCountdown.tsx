"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { msUntilDealReset } from "@/lib/homeSelection";
import styles from "./DealCountdown.module.css";

// Time left until Douala midnight — when pickDailyDeals() rotates the
// "Méga offres du jour" selection, so the countdown is truthful. Renders
// placeholders on the server and first client pass (no clock there that
// would match), then ticks every second.
export default function DealCountdown() {
  const dict = useDictionary();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(msUntilDealReset());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts =
    left === null
      ? ["--", "--", "--"]
      : [3_600_000, 60_000, 1000].map((unit, i) =>
          String(Math.floor((left / unit) % (i === 0 ? 24 : 60))).padStart(2, "0")
        );

  return (
    <span className={styles.countdown} role="timer" aria-live="off">
      <span className={styles.label}>{dict.home.dealsEndIn}</span>
      {parts.map((part, i) => (
        <b key={i} className={styles.digit}>
          {part}
        </b>
      ))}
    </span>
  );
}
