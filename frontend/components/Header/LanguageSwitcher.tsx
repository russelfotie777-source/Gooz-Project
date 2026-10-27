"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { useLang } from "@/lib/i18n/I18nProvider";
import { FranceFlag, UkFlag } from "./HeaderIcons";
import styles from "./Header.module.css";

const LANGUAGES = [
  { code: "fr" as Locale, label: "FR", Flag: FranceFlag },
  { code: "en" as Locale, label: "ENG", Flag: UkFlag },
];

// Fully self-contained (reads the current locale/path itself via hooks) —
// no props needed, renders once in the desktop header.
export default function LanguageSwitcher() {
  const lang = useLang();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const langWrapperRef = useRef<HTMLDivElement>(null);
  const activeLanguage = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    if (!langOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (langWrapperRef.current && !langWrapperRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

  // Swaps only the leading /fr or /en segment of the current URL and
  // remembers the choice in a cookie so the proxy (proxy.ts) redirects here
  // next time too, instead of falling back to the browser's Accept-Language.
  //
  // A real full-page navigation (not the router's client-side push) on
  // purpose: [lang] is the ROOT layout's own dynamic segment (it renders
  // <html>/<body> and the anti-flash theme script — see app/[lang]/
  // layout.tsx), so a soft navigation has to re-render that root layout in
  // place rather than loading a fresh document. The theme-init script is a
  // beforeInteractive one-shot — it only ever runs on a genuine page load —
  // so on a soft nav it never reapplies [data-theme], and the page was
  // silently falling back to the light theme on every language switch.
  function switchLanguage(newLang: Locale) {
    setLangOpen(false);
    if (newLang === lang) return;
    document.cookie = `shopitech-locale=${newLang}; path=/; max-age=31536000`;
    const rest = pathname.startsWith(`/${lang}`) ? pathname.slice(`/${lang}`.length) : pathname;
    window.location.href = `/${newLang}${rest || ""}`;
  }

  return (
    <div className={styles.langWrapper} ref={langWrapperRef}>
      <button
        type="button"
        className={styles.langButton}
        onClick={() => setLangOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={langOpen}
      >
        <activeLanguage.Flag className={styles.langFlag} />
        <span>{activeLanguage.label}</span>
        <img
          src="/icon/product-detail/chevron-down.svg"
          alt=""
          className={`${styles.dropdownChevron} ${styles.chevronLight} ${langOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      {langOpen && (
        <ul className={styles.langDropdown} role="listbox">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button type="button" className={styles.langOption} onClick={() => switchLanguage(l.code)}>
                <l.Flag className={styles.langFlag} />
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
