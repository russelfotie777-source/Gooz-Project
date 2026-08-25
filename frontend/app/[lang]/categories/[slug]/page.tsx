import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage/CategoryPage";
import StructuredData from "@/components/StructuredData/StructuredData";
import { getCategories } from "@/lib/api";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { canonicalAlternates } from "@/lib/seo";
import { categoryBreadcrumb } from "@/lib/structuredData";

// Duplicates CategoryPage's own getCategories() call — Next dedupes
// identical fetches within one request, so this doesn't cost a second
// round-trip. Returns the parent's default metadata if the slug doesn't
// match anything; CategoryPage's own notFound() call is what actually 404s.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";
  const categories = await getCategories().catch(() => []);
  const category = categories.find((c) => c.slug === slug);

  if (!category) return {};

  return {
    title: category.name,
    description: getDictionary(resolvedLang).seo.categoryDescription(category.name),
    alternates: canonicalAlternates(resolvedLang, `categories/${category.slug}`),
    openGraph: category.image ? { images: [category.image] } : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  // Duplicates generateMetadata's own getCategories() call — same
  // deduping as noted there. Skipped silently if not found; CategoryPage's
  // own notFound() call is what actually 404s.
  const categories = await getCategories().catch(() => []);
  const category = categories.find((c) => c.slug === slug);

  return (
    <>
      {category && <StructuredData data={categoryBreadcrumb(resolvedLang, category)} />}
      <CategoryPage categorySlug={slug} />
    </>
  );
}
