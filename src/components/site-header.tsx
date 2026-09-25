"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Compass, Languages, Leaf, Map, Plus, Users } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { Logo } from "./logo";
import { LOCALE_COOKIE, localePath, switchLocalePath } from "@/i18n/config";
import { cn } from "@/lib/format";

function useNav() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(az|en)/, "") || "/";
  const links = [
    { key: "explore", href: "/trails", label: dict.nav.explore, short: dict.nav.explore, icon: Compass, active: /^\/(trails|places)(\/|$)/.test(rest) && rest !== "/trails/new" },
    { key: "map", href: "/map", label: dict.nav.map, short: dict.nav.map, icon: Map, active: rest.startsWith("/map") },
    { key: "guides", href: "/guides", label: dict.nav.guides, short: dict.nav.guides, icon: Users, active: rest.startsWith("/guides") },
    { key: "challenges", href: "/challenges", label: dict.nav.challenges, short: dict.nav.challengesShort, icon: Leaf, active: rest.startsWith("/challenges") },
  ];
  return { locale, dict, links: links.map((l) => ({ ...l, href: localePath(locale, l.href) })) };
}

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const params = useSearchParams();
  const other = locale === "az" ? "en" : "az";
  const query = params.toString();

  return (
    <Link
      href={`${switchLocalePath(pathname, other)}${query ? `?${query}` : ""}`}
      hrefLang={other}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-ink-700 ring-1 ring-sand-300 transition hover:bg-sand-200/60", className)}
      aria-label={`${dict.nav.language}: ${dict.nav.switchTo}`}
    >
      <Languages className="size-4" />
      {other.toUpperCase()}
    </Link>
  );
}

export function SiteHeader() {
  const { locale, dict, links } = useNav();

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo href={localePath(locale)} tagline={locale === "az" ? "Azərbaycan" : "Azerbaijan"} />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map(({ key, href, label, active }) => (
            <Link
              key={key}
              href={href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                active ? "bg-forest-900 text-sand-50" : "text-ink-700 hover:bg-sand-200/70 hover:text-ink-900",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Link
            href={localePath(locale, "/trails/new")}
            className="inline-flex items-center gap-1.5 rounded-full bg-pomegranate-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-pomegranate-700"
          >
            <Plus className="size-4" strokeWidth={2.75} />
            <span className="hidden sm:inline">{dict.nav.share}</span>
            <span className="sm:hidden">{dict.nav.shareShort}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const { links } = useNav();

  return (
    <nav aria-label="Main mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-sand-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-4">
        {links.map(({ key, href, short, icon: Icon, active }) => (
          <li key={key}>
            <Link href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-semibold", active ? "text-forest-800" : "text-ink-500")}>
              <span className={cn("rounded-full px-4 py-1 transition-colors", active && "bg-moss-100")}>
                <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
              </span>
              {short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
