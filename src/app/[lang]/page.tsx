import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Droplets, Footprints, Leaf, Recycle, Users } from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { PlaceCard } from "@/components/place-card";
import { RegionPicker } from "@/components/region-picker";
import { SectionHeading } from "@/components/section-heading";
import { Topo } from "@/components/topo";
import { TrailCard } from "@/components/trail-card";
import { TrailMap } from "@/components/trail-map";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getMapData, getPlaces, getRegions, getStats, getTrails, safe } from "@/lib/data";
import { formatNumber } from "@/lib/format";

const ECO_ICONS = [Recycle, Droplets, Footprints, Leaf];

export default async function Home() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const h = dict.home;
  const p = (path: string) => localePath(locale, path);

  const [trails, places, regions, stats, mapData] = await Promise.all([
    safe(getTrails({ featured: true, per_page: 6 })),
    safe(getPlaces({ featured: true, per_page: 8 })),
    safe(getRegions()),
    safe(getStats()),
    safe(getMapData()),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden">
        <Image src="/images/trails/shahdag-greenery.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-950/55 via-forest-950/20 to-forest-950/85" />
        <div className="container-page pb-14 sm:pb-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-sand-50 uppercase backdrop-blur">
            <Leaf className="size-3.5" /> {h.eyebrow}
          </p>
          <h1 className="font-display-tight max-w-4xl text-5xl leading-[0.95] font-extrabold text-sand-50 sm:text-7xl lg:text-8xl">
            {h.titleLine1}
            <br />
            <span className="text-moss-200">{h.titleEm}</span> {h.titleLine2}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-sand-100/90">{h.subtitle}</p>
          <div className="mt-8">
            <HeroSearch regions={regions ?? []} />
          </div>
          {stats && (
            <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-4 text-sand-50 sm:flex sm:flex-wrap">
              {[
                [stats.trails, h.statTrails],
                [stats.places, h.statPlaces],
                [stats.regions, h.statRegions],
                [formatNumber(locale, stats.total_km), h.statKm],
              ].map(([v, l]) => (
                <div key={String(l)}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display-tight text-3xl font-extrabold">{v}</dd>
                  <dd className="text-xs font-semibold tracking-wide text-sand-200/80 uppercase">{l}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Featured trails */}
      {trails && trails.data.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading eyebrow={h.featuredEyebrow} title={h.featuredTitle} description={h.featuredDescription} href={p("/trails")} cta={h.exploreAll} />
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {trails.data.map((t, i) => (
              <div key={t.slug} className="w-[80%] shrink-0 snap-start sm:w-auto">
                <TrailCard trail={t} priority={i < 2} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Region map */}
      {regions && (
        <section className="bg-sand-100 py-20">
          <div className="container-page grid items-center gap-10 lg:grid-cols-[2fr_3fr]">
            <div>
              <SectionHeading eyebrow={h.regionsEyebrow} title={h.regionsTitle} description={h.regionsDescription} />
              <ul className="-mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                {regions.filter((r) => (r.trails_count ?? 0) + (r.places_count ?? 0) > 0).map((r) => (
                  <li key={r.slug}>
                    <Link href={p(`/trails?region=${r.slug}`)} className="group flex items-baseline justify-between gap-2 font-semibold text-ink-700 hover:text-forest-800">
                      <span className="group-hover:underline">{r.name}</span>
                      <span className="text-xs text-ink-400">{(r.trails_count ?? 0) + (r.places_count ?? 0)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Suspense>
              <RegionPicker regions={regions} target={p("/trails")} />
            </Suspense>
          </div>
        </section>
      )}

      {/* Places */}
      {places && places.data.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading eyebrow={h.placesEyebrow} title={h.placesTitle} description={h.placesDescription} href={p("/places")} cta={h.allPlaces} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {places.data.map((pl) => <PlaceCard key={pl.slug} place={pl} />)}
          </div>
        </section>
      )}

      {/* Map teaser */}
      {mapData && (
        <section className="container-page pb-20">
          <div className="grid overflow-hidden rounded-[2rem] bg-forest-900 text-sand-50 shadow-[var(--shadow-lift)] lg:grid-cols-[2fr_3fr]">
            <div className="relative flex flex-col justify-center gap-6 p-8 sm:p-12">
              <Topo className="pointer-events-none absolute -bottom-40 -left-40 w-[40rem] text-forest-800" />
              <div className="relative">
                <p className="mb-2 text-xs font-bold tracking-[0.2em] text-moss-200 uppercase">{h.mapEyebrow}</p>
                <h2 className="font-display-tight text-4xl font-extrabold">{h.mapTitle}</h2>
                <p className="mt-4 max-w-md text-sand-200/90">{h.mapDescription}</p>
                <Link href={p("/map")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-sand-50 px-5 py-3 text-sm font-bold text-forest-900 transition hover:bg-moss-100">
                  {h.openMap} <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <TrailMap data={mapData} className="h-80 sm:h-[28rem] lg:h-auto lg:min-h-[30rem]" />
          </div>
        </section>
      )}

      {/* Eco */}
      <section className="relative overflow-hidden bg-moss-100 py-20">
        <Topo className="pointer-events-none absolute -top-60 -right-60 w-[50rem] text-moss-200" />
        <div className="container-page relative">
          <SectionHeading eyebrow={h.ecoEyebrow} title={h.ecoTitle} description={h.ecoDescription} href={p("/challenges")} cta={h.ecoAll} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {h.eco.map(({ title, text }, i) => {
              const Icon = ECO_ICONS[i];
              return (
                <div key={title} className="rounded-[var(--radius-card)] bg-sand-50/80 p-6 ring-1 ring-moss-200 backdrop-blur">
                  <span className="grid size-11 place-items-center rounded-full bg-forest-800 text-sand-50"><Icon className="size-5" /></span>
                  <h3 className="font-display-tight mt-4 text-xl font-extrabold text-forest-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner guides */}
      <section className="container-page py-20">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-white p-8 shadow-[var(--shadow-card)] ring-1 ring-sand-200 sm:flex-row sm:items-center sm:p-10">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-moss-100 text-forest-800"><Users className="size-7" /></span>
          <div className="flex-1">
            <p className="text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">{h.guidesEyebrow}</p>
            <h2 className="font-display-tight mt-1 text-2xl font-extrabold text-forest-900 sm:text-3xl">{h.guidesTitle}</h2>
            <p className="mt-2 max-w-2xl text-ink-700">{h.guidesDescription}</p>
          </div>
          <Link href={p("/guides#apply")} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-forest-800 px-5 py-3 text-sm font-bold text-sand-50 hover:bg-forest-900">
            {h.guidesCta} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page">
        <div className="relative isolate overflow-hidden rounded-[2rem] px-8 py-16 text-center sm:px-16">
          <Image src="/images/trails/lerik.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-forest-950/90 via-forest-900/75 to-forest-800/40" />
          <h2 className="font-display-tight mx-auto max-w-2xl text-4xl font-extrabold text-sand-50 sm:text-5xl">{h.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-lg text-sand-100/90">{h.ctaText}</p>
          <Link href={p("/trails/new")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-pomegranate-600 px-6 py-3.5 font-bold text-white transition hover:bg-pomegranate-500">
            {h.ctaButton} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
