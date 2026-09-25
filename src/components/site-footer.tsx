import Link from "next/link";
import { Logo } from "./logo";
import { Topo } from "./topo";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-forest-950 pb-24 text-sand-200 md:pb-0">
      <Topo className="pointer-events-none absolute -right-40 -top-20 h-[140%] w-auto text-forest-800/60" />
      <div className="container-page relative grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="max-w-xs space-y-4">
          <Logo light />
          <p className="text-sm leading-relaxed text-sand-300/80">
            A community guide to the mountains, forests and coastlines of Azerbaijan. Walk softly and leave every trail better than you found it.
          </p>
        </div>
        <FooterCol title="Explore" links={[["All trails", "/trails"], ["Trail map", "/trails?view=map"], ["Easy walks", "/trails?difficulty=easy"], ["Waterfalls", "/trails?feature=waterfall"]]} />
        <FooterCol title="Community" links={[["Share a trail", "/trails/new"], ["Local guides", "/guides"], ["Eco-challenges", "/challenges"]]} />
        <FooterCol title="About" links={[["Photo credits", "/credits"]]} />
      </div>
      <div className="container-page relative border-t border-forest-800 py-6 text-xs text-sand-400">
        © {new Date().getFullYear()} EcoTrail. Trail information is community-sourced — always check conditions before you go.
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
            <Link href={href} className="text-sand-100 transition-colors hover:text-moss-200">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
