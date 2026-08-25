import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import PushNotificationRegistrar from "@/components/PushNotificationRegistrar/PushNotificationRegistrar";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar/ServiceWorkerRegistrar";
import StructuredData from "@/components/StructuredData/StructuredData";
import SupportButton from "@/components/SupportButton/SupportButton";
import ToastProvider from "@/components/ToastProvider/ToastProvider";
import WhatsAppButton from "@/components/WhatsAppButton/WhatsAppButton";
import { isLocale, locales } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { SITE_URL } from "@/lib/siteUrl";
import { organizationSchema, websiteSchema } from "@/lib/structuredData";
import "../globals.css";

// Sets the [data-theme] attribute before the stylesheet paints, so the page
// never flashes light-then-dark (or vice versa) on load. Can't import
// lib/theme.ts here — this has to run standalone, before any Next.js module
// executes — so the storage key and fallback logic are duplicated on
// purpose; keep both in sync if either changes.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("shopitech-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

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
    // Child routes (product/category/etc — see their own generateMetadata)
    // set title as a plain string, which fills "%s" here instead of
    // repeating "— Shopitech" everywhere. Pages that don't set their own
    // title (none should, past Phase C) fall back to `default`.
    title: {
      default: "Shopitech",
      template: "%s — Shopitech",
    },
    description: DESCRIPTIONS[resolvedLang],
    alternates: {
      canonical: `/${resolvedLang}`,
      languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
    },
    openGraph: {
      siteName: "Shopitech",
      type: "website",
      locale: resolvedLang === "fr" ? "fr_FR" : "en_US",
      // Fallback for pages that don't set their own (product pages use
      // their actual photo instead — see products/[id]/page.tsx). Reuses
      // the existing logo asset; a dedicated 1200x630 OG creative is a
      // design task, out of scope here.
      images: [
        {
          url: "/logo-shopitech-primaire/logoFichier 5version F.png",
          width: 315,
          height: 62,
          alt: "Shopitech",
        },
      ],
    },
    manifest: "/manifest.json",
    icons: {
      icon: "/favicon.ico",
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

// Brand orange (matches the app icon's background — see
// public/manifest.json) so the Android address-bar/task-switcher chrome and
// the install splash screen aren't a jarring mismatch with the icon.
export const viewport: Viewport = {
  themeColor: "#f39200",
};

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
    <html
      lang={lang}
      className={`${sora.variable} ${inter.variable}`}
      // The anti-flash script (below) sets [data-theme] on this exact node
      // before hydration, imperatively, outside React's own render — React
      // otherwise flags that as a mismatch since this JSX never declares
      // data-theme itself. Same trade-off next-themes makes; theme.ts and
      // THEME_INIT_SCRIPT are the actual source of truth for the value.
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <StructuredData data={organizationSchema()} />
        <StructuredData data={websiteSchema(lang)} />
        <I18nProvider lang={lang}>
          {children}
          <WhatsAppButton />
          <SupportButton />
          <ServiceWorkerRegistrar />
          <PushNotificationRegistrar />
          <ToastProvider />
        </I18nProvider>
      </body>
    </html>
  );
}
