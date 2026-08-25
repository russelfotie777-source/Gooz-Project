import type { Metadata } from "next";
import AboutUsPage from "@/components/AboutUsPage/AboutUsPage";
import AboutUsDesktop from "@/components/AboutUsPage/AboutUsDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ABOUT_US } from "@/lib/legal/aboutUs";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: ABOUT_US[resolvedLang].title,
    alternates: canonicalAlternates(resolvedLang, "a-propos"),
  };
}

export default function Page() {
  return (
    <>
      <AboutUsPage />
      <AboutUsDesktop />
    </>
  );
}
