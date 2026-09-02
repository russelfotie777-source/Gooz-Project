import type { Metadata } from "next";
import TermsOfUsePage from "@/components/TermsOfUsePage/TermsOfUsePage";
import TermsOfUseDesktop from "@/components/TermsOfUsePage/TermsOfUseDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { TERMS_OF_USE } from "@/lib/legal/termsOfUse";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: TERMS_OF_USE[resolvedLang].title,
    alternates: canonicalAlternates(resolvedLang, "conditions-utilisation"),
  };
}

export default function Page() {
  return (
    <>
      <TermsOfUsePage />
      <TermsOfUseDesktop />
    </>
  );
}
