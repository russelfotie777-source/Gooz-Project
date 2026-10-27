"use client";

import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";

// Shared by both the desktop and mobile search forms in Header.tsx — they
// bind to the same query/searchFocused state rather than each owning their
// own, since only one is ever visible at a time (CSS media query) but both
// stay mounted. The two forms keep their own (different) markup; this hook
// only owns the state and behavior behind them.
export function useHeaderSearch() {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const searchExamples = dict.header.searchExamples;

  const [query, setQuery] = useState("");
  const [searchExampleIndex, setSearchExampleIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const mobileSearchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchFocused || query || searchExamples.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setSearchExampleIndex((current) => (current + 1) % searchExamples.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [query, searchExamples.length, searchFocused]);

  useEffect(() => {
    if (!searchFocused) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (searchWrapperRef.current?.contains(target)) return;
      if (mobileSearchWrapperRef.current?.contains(target)) return;
      setSearchFocused(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchFocused]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchFocused(false);
    router.push(`/recherche?q=${encodeURIComponent(trimmed)}`);
  }

  return {
    query,
    setQuery,
    searchExamples,
    searchExampleIndex,
    searchFocused,
    setSearchFocused,
    mobileSearchRef,
    searchWrapperRef,
    mobileSearchWrapperRef,
    handleSearchSubmit,
  };
}
