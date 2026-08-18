"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import frDict, { type Dictionary } from "./dictionaries/fr";
import enDict from "./dictionaries/en";

const DICTIONARIES: Record<Locale, Dictionary> = { fr: frDict, en: enDict };

interface I18nContextValue {
  lang: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// Only `lang` (a plain string) crosses the Server -> Client boundary from
// app/[lang]/layout.tsx — the dictionary itself is selected right here, on
// the client, by importing both dictionary modules directly. Passing the
// resolved `dict` object as a prop instead would break: several dictionary
// entries are functions (category.resultsFound, auth.leftHeadlineDark...)
// and React Server Components cannot serialize functions across that
// boundary ("Functions cannot be passed directly to Client Components").
export function I18nProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  const value = useMemo<I18nContextValue>(() => ({ lang, dict: DICTIONARIES[lang] }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useDictionary()/useLang() must be used within <I18nProvider>");
  return ctx;
}

export function useDictionary(): Dictionary {
  return useI18n().dict;
}

export function useLang(): Locale {
  return useI18n().lang;
}
