import type { Metadata } from "next";
import HowToBuyPage from "@/components/HowToBuyPage/HowToBuyPage";
import HowToBuyDesktop from "@/components/HowToBuyPage/HowToBuyDesktop";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { HOW_TO_BUY } from "@/lib/legal/howToBuy";
import { canonicalAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang: Locale = isLocale(lang) ? lang : "fr";

  return {
    title: HOW_TO_BUY[resolvedLang].title,
    alternates: canonicalAlternates(resolvedLang, "comment-acheter"),
  };
}

export default function Page() {
  return (
    <>
      <HowToBuyPage />
      <HowToBuyDesktop />
    </>
  );
}
