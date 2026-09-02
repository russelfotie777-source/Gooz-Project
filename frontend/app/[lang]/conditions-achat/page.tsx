import type { Metadata } from "next";
import TermsOfSalePage from "@/components/TermsOfSalePage/TermsOfSalePage";
import TermsOfSaleDesktop from "@/components/TermsOfSalePage/TermsOfSaleDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { TERMS_OF_SALE } from "@/lib/legal/termsOfSale";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: TERMS_OF_SALE[resolvedLang].title,
    alternates: canonicalAlternates(resolvedLang, "conditions-achat"),
  };
}

export default function Page() {
  return (
    <>
      <TermsOfSalePage />
      <TermsOfSaleDesktop />
    </>
  );
}
