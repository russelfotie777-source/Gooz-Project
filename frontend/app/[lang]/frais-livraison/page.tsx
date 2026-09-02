import type { Metadata } from "next";
import DeliveryFeesPage from "@/components/DeliveryFeesPage/DeliveryFeesPage";
import DeliveryFeesDesktop from "@/components/DeliveryFeesPage/DeliveryFeesDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { DELIVERY_FEES } from "@/lib/legal/deliveryFees";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: DELIVERY_FEES[resolvedLang].title,
    alternates: canonicalAlternates(resolvedLang, "frais-livraison"),
  };
}

export default function Page() {
  return (
    <>
      <DeliveryFeesPage />
      <DeliveryFeesDesktop />
    </>
  );
}
