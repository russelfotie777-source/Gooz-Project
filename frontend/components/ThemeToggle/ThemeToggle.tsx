"use client";

import { useEffect, useState } from "react";
import { applyTheme, currentTheme, type Theme } from "@/lib/theme";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./ThemeToggle.module.css";

// Always starts at "light" — matching what the server rendered exactly —
// then corrects to the real theme in an effect once mounted. Reading
// currentTheme() straight into useState (the first attempt here) has the
// client's hydration-time render disagree with the server whenever the
// resolved theme is "dark": React can't just patch a mismatch when the
// *icon itself* swaps to a differently-shaped SVG, so it discards and
// remounts the whole subtree — worse than the one-tick "wrong icon" flash
// this causes instead, the same trade-off next-themes makes.
export default function ThemeToggle({ className }: { className?: string }) {
  const dict = useDictionary();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  // Picks up a change made from another tab (storage event) so two open
  // tabs don't disagree after one of them toggles.
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "shopitech-theme") setTheme(currentTheme());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  const label = theme === "dark" ? dict.header.toggleToLight : dict.header.toggleToDark;

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className ?? ""}`}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.66 4.34l-1.42 1.42M5.76 14.24l-1.42 1.42M15.66 15.66l-1.42-1.42M5.76 5.76 4.34 4.34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
      <path
        d="M17 11.5A7.5 7.5 0 0 1 8.5 3a7.5 7.5 0 1 0 8.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
