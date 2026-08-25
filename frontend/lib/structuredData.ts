import type { Category, Product } from "./types";
import { SITE_URL } from "./siteUrl";

// Displayed on a white/neutral background by whatever reads this (Google's
// Knowledge Panel, etc.) — not the Header's white-on-black logo variant.
const LOGO_URL = `${SITE_URL}/logo-shopitech-primaire/logoFichier 5version F.png`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Shopitech",
    url: SITE_URL,
    logo: LOGO_URL,
  };
}

export function websiteSchema(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Shopitech",
    url: `${SITE_URL}/${lang}`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${lang}/recherche?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productSchema(product: Product, absoluteUrl: string, imageUrl: string | undefined) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    sku: product.reference,
    image: imageUrl ? [imageUrl] : undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    category: product.category?.name,
    url: absoluteUrl,
    offers:
      product.price_from != null
        ? {
            "@type": "Offer",
            url: absoluteUrl,
            priceCurrency: "XAF",
            price: product.price_from,
            availability:
              product.stock_quantity == null
                ? undefined
                : product.stock_quantity > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
          }
        : undefined,
  };
}

export function categoryBreadcrumb(lang: string, category: Category) {
  return breadcrumbSchema([
    { name: "Shopitech", url: `${SITE_URL}/${lang}` },
    { name: category.name, url: `${SITE_URL}/${lang}/categories/${category.slug}` },
  ]);
}

export function productBreadcrumb(lang: string, product: Product, absoluteUrl: string) {
  const items: BreadcrumbItem[] = [{ name: "Shopitech", url: `${SITE_URL}/${lang}` }];

  if (product.category) {
    items.push({
      name: product.category.name,
      url: `${SITE_URL}/${lang}/categories/${product.category.slug}`,
    });
  }

  items.push({ name: product.name, url: absoluteUrl });

  return breadcrumbSchema(items);
}
