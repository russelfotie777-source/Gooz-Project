import type { Metadata } from "next";
import AllAboutDeliveryPage from "@/components/AllAboutDeliveryPage/AllAboutDeliveryPage";
import AllAboutDeliveryDesktop from "@/components/AllAboutDeliveryPage/AllAboutDeliveryDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ALL_ABOUT_DELIVERY } from "@/lib/legal/allAboutDelivery";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: ALL_ABOUT_DELIVERY[resolvedLang].title,
    alternates: canonicalAlternates(resolvedLang, "tout-sur-la-livraison"),
  };
}

export default function Page() {
  return (
    <>
      <AllAboutDeliveryPage />
      <AllAboutDeliveryDesktop />
    </>
  );
}
