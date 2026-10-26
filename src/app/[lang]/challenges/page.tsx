import type { Metadata } from "next";
import Link from "next/link";
import { Bus, Camera, Droplets, Flame, Footprints, Leaf, MapPinPlus, Recycle, ShoppingBasket, Sprout } from "lucide-react";
import { Topo } from "@/components/topo";
import { fill, localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

const ICONS = { recycle: Recycle, droplets: Droplets, footprints: Footprints, basket: ShoppingBasket, bus: Bus, flame: Flame, camera: Camera, mapPin: MapPinPlus, sprout: Sprout };

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.challenges.eyebrow, description: dict.challenges.intro };
}

export default async function ChallengesPage() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const c = dict.challenges;

  return (
    <>
      <section className="relative overflow-hidden bg-forest-900 text-sand-50">
        <Topo className="pointer-events-none absolute -top-40 -right-40 w-[48rem] text-forest-800" />
        <div className="container-page relative py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-moss-200 uppercase"><Leaf className="size-4" /> {c.eyebrow}</p>
          <h1 className="font-display-tight mt-3 max-w-3xl text-5xl leading-[1] font-extrabold sm:text-6xl">
            {c.titleA} <span className="text-moss-200">{c.titleEm}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-sand-200/90">{c.intro}</p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            return (
              <article key={item.title} className="group relative flex flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-sand-200">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-moss-100 text-forest-800 transition group-hover:bg-forest-800 group-hover:text-sand-50"><Icon className="size-6" /></span>
                  <span className="rounded-full bg-ochre-100 px-2.5 py-1 text-xs font-bold text-[#7a5410]">{fill(c.points, { points: item.points })}</span>
                </div>
                <p className="mt-5 text-[0.65rem] font-bold tracking-[0.16em] text-ink-500 uppercase">{c.levels[item.level as keyof typeof c.levels]}</p>
                <h2 className="font-display-tight mt-1 text-xl font-extrabold text-forest-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container-page">
        <div className="grid gap-10 rounded-[2rem] bg-moss-100 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display-tight text-3xl font-extrabold text-forest-900 sm:text-4xl">{c.lntTitle}</h2>
            <p className="mt-4 text-ink-700">{c.lntIntro}</p>
            <Link href={localePath(locale, "/trails")} className="mt-8 inline-flex rounded-full bg-forest-800 px-5 py-3 text-sm font-bold text-sand-50 hover:bg-forest-900">{c.findTrail}</Link>
          </div>
          <ol className="space-y-2">
            {c.lnt.map((p, i) => (
              <li key={p} className="flex items-center gap-4 rounded-2xl bg-sand-50 px-4 py-3 font-semibold text-ink-900">
                <span className="font-display-tight grid size-9 shrink-0 place-items-center rounded-full bg-forest-800 text-sand-50">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
