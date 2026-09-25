"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";
import { cn } from "@/lib/format";

export function useIsActive() {
  const pathname = usePathname();
  const params = useSearchParams();
  return (href: string) => {
    const [path, query] = href.split("?");
    if (query === "view=map") return pathname === "/trails" && params.get("view") === "map";
    if (path === "/trails") return pathname.startsWith("/trails") && params.get("view") !== "map" && pathname !== "/trails/new";
    return pathname.startsWith(path);
  };
}

export function SiteHeader() {
  const isActive = useIsActive();

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                isActive(href) ? "bg-forest-900 text-sand-50" : "text-ink-700 hover:bg-sand-200/70 hover:text-ink-900",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/trails/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-pomegranate-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-pomegranate-700"
        >
          <Plus className="size-4" strokeWidth={2.75} />
          <span className="hidden sm:inline">Share a trail</span>
          <span className="sm:hidden">Share</span>
        </Link>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Main mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-sand-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-semibold",
                  active ? "text-forest-800" : "text-ink-500",
                )}
              >
                <span className={cn("rounded-full px-4 py-1 transition-colors", active && "bg-moss-100")}>
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
                </span>
                {label === "Eco-challenges" ? "Eco" : label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
