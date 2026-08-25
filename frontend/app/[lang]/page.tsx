import type { Metadata } from "next";
import HomePage from "@/components/HomePage/HomePage";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { canonicalAlternates } from "@/lib/seo";

// The root layout's own alternates.canonical ("/${lang}") already covers
// this exact route — this override exists so the pattern is consistent
// everywhere (every routed page sets its own metadata, none rely on
// inheriting the layout's), and so it stops silently "working by accident"
// if the layout's fallback ever changes.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    alternates: canonicalAlternates(resolvedLang, ""),
  };
}

export default function Home() {
  return <HomePage />;
}
