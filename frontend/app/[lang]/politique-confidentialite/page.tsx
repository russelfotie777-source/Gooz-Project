import type { Metadata } from "next";
import PrivacyPolicyPage from "@/components/PrivacyPolicyPage/PrivacyPolicyPage";
import PrivacyPolicyDesktop from "@/components/PrivacyPolicyPage/PrivacyPolicyDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { PRIVACY_POLICY } from "@/lib/legal/privacyPolicy";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: PRIVACY_POLICY[resolvedLang].title,
    alternates: canonicalAlternates(resolvedLang, "politique-confidentialite"),
  };
}

export default function Page() {
  return (
    <>
      <PrivacyPolicyPage />
      <PrivacyPolicyDesktop />
    </>
  );
}
