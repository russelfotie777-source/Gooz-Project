import type { Metadata } from "next";
import ReturnPolicyPage from "@/components/ReturnPolicyPage/ReturnPolicyPage";
import ReturnPolicyDesktop from "@/components/ReturnPolicyPage/ReturnPolicyDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { RETURN_POLICY } from "@/lib/legal/returnPolicy";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: RETURN_POLICY[resolvedLang].title,
    alternates: canonicalAlternates(resolvedLang, "politique-retour"),
  };
}

export default function Page() {
  return (
    <>
      <ReturnPolicyPage />
      <ReturnPolicyDesktop />
    </>
  );
}
