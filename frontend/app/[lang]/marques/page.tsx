import type { Metadata } from "next";
import BrandsIndexPage from "@/components/BrandsIndexPage/BrandsIndexPage";
import { getBrands } from "@/lib/api";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";
  const copy = getDictionary(resolvedLang).brandsIndex;
  return {
    title: copy.title,
    description: copy.description,
    alternates: canonicalAlternates(resolvedLang, "marques"),
  };
}

// "Voir tout" behind the homepage's brands strip.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const brands = await getBrands().catch(() => []);
  return <BrandsIndexPage brands={brands} lang={isLocale(lang) ? lang : "fr"} />;
}
