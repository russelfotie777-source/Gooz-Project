import type { Metadata } from "next";
import HelpCenterPage from "@/components/HelpCenterPage/HelpCenterPage";
import HelpCenterDesktop from "@/components/HelpCenterPage/HelpCenterDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: getDictionary(resolvedLang).profile.helpCenterTitle,
    alternates: canonicalAlternates(resolvedLang, "aide"),
  };
}

export default function Page() {
  return (
    <>
      <HelpCenterPage />
      <HelpCenterDesktop />
    </>
  );
}
