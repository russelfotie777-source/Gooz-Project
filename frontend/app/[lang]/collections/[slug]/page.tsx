import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionPage from "@/components/CollectionPage/CollectionPage";
import { COLLECTIONS, findCollection } from "@/lib/collections";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { parsePageParam } from "@/lib/pagination";
import { canonicalAlternates } from "@/lib/seo";

// The pages behind the homepage's "Voir tout" links — see lib/collections.ts.

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";
  const collection = findCollection(slug);
  if (!collection) return {};

  const copy = getDictionary(resolvedLang).collections[collection.key];
  return {
    title: copy.title,
    description: copy.description,
    alternates: canonicalAlternates(resolvedLang, `collections/${collection.slug}`),
    // Personalized per browser — nothing meaningful for a crawler to index.
    robots: collection.personal ? { index: false, follow: true } : undefined,
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
  const collection = findCollection(slug);
  if (!collection) notFound();

  return <CollectionPage collection={collection} lang={isLocale(lang) ? lang : "fr"} page={parsePageParam(page)} />;
}
