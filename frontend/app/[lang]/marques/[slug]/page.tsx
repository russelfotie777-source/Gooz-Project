import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandPage from "@/components/BrandPage/BrandPage";
import StructuredData from "@/components/StructuredData/StructuredData";
import { getBrands } from "@/lib/api";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { parsePageParam } from "@/lib/pagination";
import { canonicalAlternates } from "@/lib/seo";
import { brandBreadcrumb } from "@/lib/structuredData";

// Same pattern as app/[lang]/categories/[slug]/page.tsx: no dedicated
// "get brand by slug" endpoint exists (Admin\BrandController's {brand}
// route-binds by id, not slug — see BrandController::show()), so this
// fetches the full (cached) brand list and finds the match itself, same as
// the category page already does for categories.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";
  const brands = await getBrands().catch(() => []);
  const brand = brands.find((b) => b.slug === slug);

  if (!brand) return {};

  return {
    title: brand.name,
    description: getDictionary(resolvedLang).seo.brandDescription(brand.name),
    alternates: canonicalAlternates(resolvedLang, `marques/${brand.slug}`),
    openGraph: brand.logo ? { images: [brand.logo] } : undefined,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang, slug } = await params;
  const { page } = await searchParams;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  const brands = await getBrands().catch(() => []);
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  return (
    <>
      <StructuredData data={brandBreadcrumb(resolvedLang, brand)} />
      <BrandPage brand={brand} page={parsePageParam(page)} />
    </>
  );
}
