import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Droplets, Footprints, Leaf, Recycle, Star } from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { SectionHeading } from "@/components/section-heading";
import { TrailCard } from "@/components/trail-card";
import { TrailMap } from "@/components/trail-map";
import { Topo } from "@/components/topo";
import { Monogram } from "@/components/monogram";
import { getGuides, getRegions, getStats, getTrails, safe } from "@/lib/data";
import type { MapTrail } from "@/lib/types";

const REGION_IMAGES: Record<string, string> = {
  ismayilli: "/images/trails/qaranohur-lake.jpg",
  qusar: "/images/trails/shahdag-waterfall.jpg",
  quba: "/images/trails/khinalug.jpg",
  gabala: "/images/trails/tufandag.jpg",
  goygol: "/images/trails/goygol-lake.jpg",
  gakh: "/images/trails/ilisu.jpg",
  gobustan: "/images/trails/gobustan.jpg",
  lerik: "/images/trails/lerik.jpg",
};

export default async function Home() {
  const [featured, all, regions, stats, guides] = await Promise.all([
    safe(getTrails({ featured: true, per_page: 4 })),
    safe(getTrails()),
    safe(getRegions()),
    safe(getStats()),
    safe(getGuides()),
  ]);

  const mapTrails: MapTrail[] = (all?.data ?? []).map((t) => ({
    slug: t.slug,
    name: t.name,
    difficulty: t.difficulty,
    location: t.location,
    cover_image: t.cover_image,
    region: t.region?.name,
    distance_km: t.distance_km,
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden">
        <Image
          src="/images/trails/shahdag-greenery.jpg"
          alt="Green ridges and canyons in Shahdag National Park"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-950/55 via-forest-950/20 to-forest-950/85" />
        <div className="container-page pb-14 sm:pb-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-sand-50 uppercase backdrop-blur">
            <Leaf className="size-3.5" /> Azerbaijan trail explorer
          </p>
          <h1 className="font-display-tight max-w-4xl text-5xl leading-[0.95] font-semibold text-sand-50 sm:text-7xl lg:text-8xl">
            Nine climates.<br />
            <span className="italic font-normal text-moss-200">Endless</span> trails.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-sand-100/90">
            From Caucasus waterfalls to Talysh forests and Gobustan&apos;s ancient rock art — find your next hike, meet local guides and help keep it wild.
          </p>
          <div className="mt-8">
            <HeroSearch regions={regions ?? []} />
          </div>
          {stats && (
            <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-4 text-sand-50 sm:flex sm:flex-wrap">
              {[
                [stats.trails, "curated trails"],
                [stats.regions, "regions"],
                [`${stats.total_km} km`, "of paths"],
                [stats.reviews, "hiker reviews"],
              ].map(([v, l]) => (
                <div key={String(l)}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display-tight text-3xl font-semibold">{v}</dd>
                  <dd className="text-xs font-semibold tracking-wide text-sand-200/80 uppercase">{l}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Featured */}
      {featured && featured.data.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading
            eyebrow="Editor's picks"
            title="Trails worth the drive"
            description="Hand-picked hikes that show off the country's range — lakes, canyons, highland villages and alpine ridges."
            href="/trails"
            cta="Explore all trails"
          />
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {featured.data.map((t, i) => (
              <div key={t.slug} className="w-[78%] shrink-0 snap-start sm:w-auto">
                <TrailCard trail={t} priority={i < 2} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Regions */}
      {regions && regions.length > 0 && (
        <section className="bg-sand-100 py-20">
          <div className="container-page">
            <SectionHeading eyebrow="By region" title="Where do you want to wander?" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {regions.map((r, i) => (
                <Link
                  key={r.slug}
                  href={`/trails?region=${r.slug}`}
                  className={`group relative isolate flex min-h-40 flex-col justify-end overflow-hidden rounded-[var(--radius-card)] p-4 text-sand-50 sm:min-h-52 ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""} ${i === regions.length - 1 && (regions.length + 3) % 4 === 3 ? "lg:col-span-2" : ""}`}
                >
                  {REGION_IMAGES[r.slug] && (
                    <Image src={REGION_IMAGES[r.slug]} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="-z-10 object-cover transition duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/80 to-forest-950/0" />
                  <p className="font-display-tight text-2xl font-semibold sm:text-3xl">{r.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-sand-100/85 sm:text-sm">{r.description}</p>
                  <p className="mt-2 text-xs font-bold tracking-wide text-moss-200 uppercase">
                    {r.trails_count} {r.trails_count === 1 ? "trail" : "trails"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map teaser */}
      {mapTrails.length > 0 && (
        <section className="container-page py-20">
          <div className="grid overflow-hidden rounded-[2rem] bg-forest-900 text-sand-50 shadow-[var(--shadow-lift)] lg:grid-cols-[2fr_3fr]">
            <div className="relative flex flex-col justify-center gap-6 p-8 sm:p-12">
              <Topo className="pointer-events-none absolute -bottom-40 -left-40 w-[40rem] text-forest-800" />
              <div className="relative">
                <p className="mb-2 text-xs font-bold tracking-[0.2em] text-moss-200 uppercase">Plan your route</p>
                <h2 className="font-display-tight text-4xl font-semibold">Every trailhead on one map</h2>
                <p className="mt-4 max-w-md text-sand-200/90">
                  See what&apos;s close to where you&apos;re staying, compare difficulty at a glance and get directions straight to the start.
                </p>
                <Link href="/trails?view=map" className="mt-8 inline-flex items-center gap-2 rounded-full bg-sand-50 px-5 py-3 text-sm font-bold text-forest-900 transition hover:bg-moss-100">
                  Open the map <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <TrailMap trails={mapTrails} compact className="h-80 sm:h-[28rem] lg:h-auto lg:min-h-[30rem]" />
          </div>
        </section>
      )}

      {/* Eco */}
      <section className="relative overflow-hidden bg-moss-100 py-20">
        <Topo className="pointer-events-none absolute -top-60 -right-60 w-[50rem] text-moss-200" />
        <div className="container-page relative">
          <SectionHeading
            eyebrow="Eco-challenges"
            title="Leave it better than you found it"
            description="Azerbaijan's wild places are fragile and increasingly popular. Small habits keep them beautiful for the next hiker — and the villages that live alongside them."
            href="/challenges"
            cta="See all challenges"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Recycle, title: "Pack it out", text: "Carry out every wrapper and bottle — and one piece of someone else's litter." },
              { icon: Droplets, title: "Refill at springs", text: "Mountain springs (bulaq) are everywhere. Bring a bottle, skip the plastic." },
              { icon: Footprints, title: "Stay on the path", text: "Shortcuts erode slopes and meadows that take years to recover." },
              { icon: Leaf, title: "Buy local", text: "Honey, cheese and tea from village families keep tourism money in the mountains." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[var(--radius-card)] bg-sand-50/80 p-6 ring-1 ring-moss-200 backdrop-blur">
                <span className="grid size-11 place-items-center rounded-full bg-forest-800 text-sand-50">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display-tight text-xl font-semibold text-forest-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      {guides && guides.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading
            eyebrow="Go with a local"
            title="Meet professional guides"
            description="Partner guides and tour agencies who know the passes, the weather and the families who'll pour you tea."
            href="/guides"
            cta="All guides"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {guides.slice(0, 3).map((g) => (
              <Link key={g.slug} href="/guides" className="group rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-sand-200 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-center gap-4">
                  <Monogram name={g.name} />
                  <div>
                    <p className="flex items-center gap-1.5 font-bold text-ink-900">
                      {g.name}
                      {g.is_verified && <BadgeCheck className="size-4 text-forest-600" aria-label="Verified" />}
                    </p>
                    <p className="text-sm text-ink-500">{g.region?.name} · {g.kind === "agency" ? "Tour agency" : "Guide"}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-forest-800">{g.headline}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 font-bold"><Star className="size-4 fill-ochre-500 text-ochre-500" />{g.rating.toFixed(1)}</span>
                  {g.price_from_azn && <span className="text-ink-500">from <b className="text-ink-900">{g.price_from_azn} ₼</b></span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page">
        <div className="relative isolate overflow-hidden rounded-[2rem] px-8 py-16 text-center sm:px-16">
          <Image src="/images/trails/lerik.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-forest-950/90 via-forest-900/75 to-forest-800/40" />
          <h2 className="font-display-tight mx-auto max-w-2xl text-4xl font-semibold text-sand-50 sm:text-5xl">Know a trail we&apos;re missing?</h2>
          <p className="mx-auto mt-4 max-w-lg text-sand-100/90">
            Share your route, photos and tips. Every submission is reviewed before it goes live for other hikers.
          </p>
          <Link href="/trails/new" className="mt-8 inline-flex items-center gap-2 rounded-full bg-pomegranate-600 px-6 py-3.5 font-bold text-white transition hover:bg-pomegranate-500">
            Share a trail <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
