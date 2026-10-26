import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geologica } from "next/font/google";
import { I18nProvider } from "@/components/i18n-provider";
import { MobileTabBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import "../globals.css";

// One family throughout, as in ODLAR: Geologica has Azerbaijani ə/Ə, the ₼ sign, tabular figures and a "sharpness" axis for headings.
const geologica = Geologica({ variable: "--font-geologica", subsets: ["latin", "latin-ext"], axes: ["SHRP"], display: "swap" });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: { default: dict.meta.title, template: dict.meta.titleTemplate },
    description: dict.meta.description,
    alternates: { languages: { az: "/az", en: "/en" } },
  };
}

export const viewport: Viewport = { themeColor: "#fbf8f2" };

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <html lang={locale} className={`${geologica.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <I18nProvider locale={locale} dict={dict}>
          <Suspense fallback={<div className="h-16 border-b border-sand-200" />}>
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <SiteFooter locale={locale} dict={dict} />
          <Suspense>
            <MobileTabBar />
          </Suspense>
        </I18nProvider>
      </body>
    </html>
  );
}
