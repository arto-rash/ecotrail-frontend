import Link from "next/link";
import { Logo } from "./logo";
import { Topo } from "./topo";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const f = dict.footer;
  const p = (path: string) => localePath(locale, path);
  return (
    <footer className="relative mt-24 overflow-hidden bg-forest-950 pb-24 text-sand-200 md:pb-0">
      <Topo className="pointer-events-none absolute -top-20 -right-40 h-[140%] w-auto text-forest-800/60" />
      <div className="container-page relative grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="max-w-xs space-y-4">
          <Logo href={p("/")} light tagline={locale === "az" ? "Azərbaycan" : "Azerbaijan"} />
          <p className="text-sm leading-relaxed text-sand-300/80">{f.about}</p>
        </div>
        <FooterCol title={f.explore} links={[[f.allTrails, p("/trails")], [f.allPlaces, p("/places")], [f.map, p("/map")], [f.waterfalls, p("/places?type=waterfall")]]} />
        <FooterCol title={f.community} links={[[f.share, p("/trails/new")], [f.guides, p("/guides")], [f.challenges, p("/challenges")]]} />
        <FooterCol title={f.aboutTitle} links={[[f.sources, p("/sources")]]} />
      </div>
      <div className="container-page relative border-t border-forest-800 py-6 text-xs text-sand-400">
        © {new Date().getFullYear()} EcoTrail · © OpenStreetMap contributors. {f.disclaimer}
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold tracking-[0.18em] text-sand-400 uppercase">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sand-100 transition-colors hover:text-moss-200">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
