import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import PushNotificationRegistrar from "@/components/PushNotificationRegistrar/PushNotificationRegistrar";
import SupportButton from "@/components/SupportButton/SupportButton";
import ToastProvider from "@/components/ToastProvider/ToastProvider";
import WhatsAppButton from "@/components/WhatsAppButton/WhatsAppButton";
import { isLocale, locales } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import "../globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTIONS = {
  fr: "Shopitech — Découvrez un univers d'articles",
  en: "Shopitech — Discover a world of products",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang = isLocale(lang) ? lang : "fr";

  // Was a single static object shared by both locales — no hreflang/
  // alternates.languages at all, which search engines need to serve the
  // right locale to the right audience instead of treating /fr and /en as
  // duplicate content.
  return {
    metadataBase: new URL(SITE_URL),
    title: "Shopitech",
    description: DESCRIPTIONS[resolvedLang],
    alternates: {
      canonical: `/${resolvedLang}`,
      languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
    },
    openGraph: {
      locale: resolvedLang === "fr" ? "fr_FR" : "en_US",
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "fr" }, { lang: "en" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${sora.variable} ${inter.variable}`}>
      <body>
        <I18nProvider lang={lang}>
          {children}
          <WhatsAppButton />
          <SupportButton />
          <PushNotificationRegistrar />
          <ToastProvider />
        </I18nProvider>
      </body>
    </html>
  );
}
