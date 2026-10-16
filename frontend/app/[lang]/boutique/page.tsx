import type { Metadata } from "next";
import StorePage from "@/components/StorePage/StorePage";
import { getProducts } from "@/lib/api";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";
  const dict = getDictionary(resolvedLang);

  return {
    title: dict.store.title,
    alternates: canonicalAlternates(resolvedLang, "boutique"),
  };
}

// Reached from the mobile bottom nav's new "store" slot (see BottomNav.tsx).
// The backend's own per_page cap (200 — see ProductController::index) is
// as close to "the whole catalogue" as a single request gets; real
// pagination here is a later problem once the catalogue outgrows that.
// Ordering is deliberately left to StorePage, not done here: this is a
// Server Component, so an order decided here would be the exact same order
// cached and served to every visitor within the revalidation window — see
// StorePage's own comment for why the shuffle has to happen client-side.
export default async function Page() {
  const products = await getProducts({ per_page: 200 });

  return <StorePage products={products} />;
}
