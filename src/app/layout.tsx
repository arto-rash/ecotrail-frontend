import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Manrope } from "next/font/google";
import { MobileTabBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "WONK", "opsz"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "EcoTrail — Hiking trails across Azerbaijan",
    template: "%s · EcoTrail",
  },
  description:
    "Discover waterfalls, alpine lakes and mountain villages across Azerbaijan. Community-sourced hiking trails, maps and local guides.",
};

export const viewport: Viewport = {
  themeColor: "#fbf8f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<div className="h-16 border-b border-sand-200" />}>
          <SiteHeader />
        </Suspense>
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Suspense>
          <MobileTabBar />
        </Suspense>
      </body>
    </html>
  );
}
