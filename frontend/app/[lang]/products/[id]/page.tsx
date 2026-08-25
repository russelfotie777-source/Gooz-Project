import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage/ProductPage";
import StructuredData from "@/components/StructuredData/StructuredData";
import { getProduct, getProducts, resolveMediaUrl } from "@/lib/api";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { productPath } from "@/lib/productUrl";
import { canonicalAlternates, localizedPath } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";
import { productBreadcrumb, productSchema } from "@/lib/structuredData";

// parseInt stops at the first non-digit, so "42-iphone-15-pro" and a bare
// "42" (old/shared link, see lib/productUrl.ts) both resolve the same way —
// the slug after the id is cosmetic, never the lookup key.
function parseProductId(idParam: string): number | null {
  const numericId = parseInt(idParam, 10);
  return Number.isNaN(numericId) ? null : numericId;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";
  const numericId = parseProductId(id);
  const product = numericId === null ? null : await getProduct(numericId).catch(() => null);

  if (!product) return {};

  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
  const description =
    product.description?.trim() || getDictionary(resolvedLang).seo.productDescriptionFallback(product.name);
  const path = productPath(product).replace(/^\//, "");

  return {
    title: product.name,
    description,
    alternates: canonicalAlternates(resolvedLang, path),
    openGraph: {
      title: product.name,
      description,
      images: primaryImage ? [resolveMediaUrl(primaryImage.image_url)] : undefined,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  const numericId = parseProductId(id);
  const product = numericId === null ? null : await getProduct(numericId).catch(() => null);
  if (!product) notFound();

  // The main product above already has to succeed (404s otherwise) — a
  // failure on this secondary call is not worth taking down a page that
  // otherwise loaded fine; just show it with no recommendations.
  const otherProducts = await getProducts({ per_page: 8 }).catch(() => []);
  const recommendedProducts = otherProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const absoluteUrl = `${SITE_URL}${localizedPath(resolvedLang, productPath(product).replace(/^\//, ""))}`;
  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];

  return (
    <>
      <StructuredData
        data={productSchema(product, absoluteUrl, primaryImage ? resolveMediaUrl(primaryImage.image_url) : undefined)}
      />
      <StructuredData data={productBreadcrumb(resolvedLang, product, absoluteUrl)} />
      <ProductPage product={product} recommendedProducts={recommendedProducts} />
    </>
  );
}
