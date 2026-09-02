import type { MetadataRoute } from "next";
import { getCategories, getProductsPage } from "@/lib/api";
import { locales } from "@/lib/i18n/config";
import { productPath } from "@/lib/productUrl";
import { SITE_URL } from "@/lib/siteUrl";

// Public, indexable pages only — see app/robots.ts for the private routes
// (cart, checkout, compte...) intentionally left out of both.
const STATIC_PATHS = [
  "",
  "a-propos",
  "aide",
  "comment-acheter",
  "conditions-achat",
  "conditions-utilisation",
  "frais-livraison",
  "politique-confidentialite",
  "politique-retour",
  "tout-sur-la-livraison",
];

function localizedUrl(locale: string, path: string): string {
  return `${SITE_URL}/${locale}${path ? `/${path}` : ""}`;
}

function alternates(path: string) {
  return {
    languages: Object.fromEntries(locales.map((locale) => [locale, localizedUrl(locale, path)])),
  };
}

// Backend caps per_page at 200 (see ProductController::index) — looping
// pages instead of a single fetch so the sitemap doesn't silently truncate
// once the catalogue grows past that.
async function allActiveProducts() {
  const first = await getProductsPage({ per_page: 200, page: 1 });
  const products = [...first.products];

  for (let page = 2; page <= first.lastPage; page++) {
    const next = await getProductsPage({ per_page: 200, page });
    products.push(...next.products);
  }

  return products;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), allActiveProducts()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency: path === "" ? ("daily" as const) : ("yearly" as const),
      priority: path === "" ? 1 : 0.5,
      alternates: alternates(path),
    }))
  );

  const categoryEntries: MetadataRoute.Sitemap = categories.flatMap((category) =>
    locales.map((locale) => ({
      url: localizedUrl(locale, `categories/${category.slug}`),
      lastModified: category.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: alternates(`categories/${category.slug}`),
    }))
  );

  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) => {
    const path = productPath(product).replace(/^\//, "");

    return locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified: product.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: alternates(path),
    }));
  });

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
