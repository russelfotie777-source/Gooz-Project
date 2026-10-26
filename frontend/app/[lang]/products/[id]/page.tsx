import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage/ProductPage";
import StructuredData from "@/components/StructuredData/StructuredData";
import {
  getAlsoViewedProducts,
  getBanners,
  getProduct,
  getProductReviews,
  getProducts,
  getRelatedProducts,
  resolveMediaUrl,
} from "@/lib/api";
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
    product.meta_description?.trim() ||
    product.description?.trim() ||
    getDictionary(resolvedLang).seo.productDescriptionFallback(product.name);
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
  // failure on any of these secondary calls isn't worth taking down a page
  // that otherwise loaded fine; each just shows its section as empty. Run
  // them in parallel rather than one after another — they're independent
  // network calls, so awaiting each in turn only adds up their latencies
  // for no benefit.
  const [relatedProducts, alsoViewedProducts, brandProductsRaw, adBanners, reviews] = await Promise.all([
    getRelatedProducts(product.id).catch(() => []),
    getAlsoViewedProducts(product.id).catch(() => []),
    product.brand
      ? getProducts({ brand_id: product.brand.id, per_page: 12 }).catch(() => [])
      : Promise.resolve([]),
    getBanners("product").catch(() => []),
    getProductReviews(product.id).catch(() => []),
  ]);

  // Same brand, minus the product itself and whatever already showed up in
  // the two sections above — no point suggesting the same item three times.
  const shownProductIds = new Set([
    product.id,
    ...relatedProducts.map((p) => p.id),
    ...alsoViewedProducts.map((p) => p.id),
  ]);
  const brandProducts = brandProductsRaw.filter((p) => !shownProductIds.has(p.id)).slice(0, 8);

  const absoluteUrl = `${SITE_URL}${localizedPath(resolvedLang, productPath(product).replace(/^\//, ""))}`;
  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];

  return (
    <>
      <StructuredData
        data={productSchema(product, absoluteUrl, primaryImage ? resolveMediaUrl(primaryImage.image_url) : undefined)}
      />
      <StructuredData data={productBreadcrumb(resolvedLang, product, absoluteUrl)} />
      <ProductPage
        product={product}
        relatedProducts={relatedProducts}
        alsoViewedProducts={alsoViewedProducts}
        brandProducts={brandProducts}
        adBanners={adBanners}
        reviews={reviews}
      />
    </>
  );
}
