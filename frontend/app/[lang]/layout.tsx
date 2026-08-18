import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import PushNotificationRegistrar from "@/components/PushNotificationRegistrar/PushNotificationRegistrar";
import SupportButton from "@/components/SupportButton/SupportButton";
import WhatsAppButton from "@/components/WhatsAppButton/WhatsAppButton";
import { isLocale } from "@/lib/i18n/config";
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

export const metadata: Metadata = {
  title: "Shopitech",
  description: "Shopitech — Découvrez un univers d'articles",
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
    <html lang={lang} className={`${sora.variable} ${inter.variable}`}>
      <body>
        <I18nProvider lang={lang}>
          {children}
          <WhatsAppButton />
          <SupportButton />
          <PushNotificationRegistrar />
        </I18nProvider>
      </body>
    </html>
  );
}
