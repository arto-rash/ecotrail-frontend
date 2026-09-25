import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, CalendarDays, Clock, Download, ExternalLink, MapPin, Mountain, MountainSnow, Navigation, Route, Signpost, Users,
} from "lucide-react";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Rating, Stars } from "@/components/rating";
import { ShareButton } from "@/components/share-button";
import { TrailCard } from "@/components/trail-card";
import { TrailMap } from "@/components/trail-map";
import { imageUrl } from "@/lib/api";
import { creditFor } from "@/lib/credits";
import { getNearbyTrails, getTrail, safe } from "@/lib/data";
import { DIFFICULTY, FEATURE_LABEL, MONTHS, MONTH_NAMES, ROUTE_TYPE, cn, formatDistance, formatDuration } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/trails/[slug]">): Promise<Metadata> {
  const trail = await safe(getTrail((await params).slug));
  if (!trail) return { title: "Trail not found" };
  return {
    title: `${trail.name} — ${trail.region?.name}`,
    description: trail.summary,
    openGraph: { images: trail.cover_image ? [imageUrl(trail.cover_image)!] : [] },
  };
}

export default async function TrailPage({ params }: PageProps<"/trails/[slug]">) {
  const { slug } = await params;
  const [trail, nearby] = await Promise.all([getTrail(slug), safe(getNearbyTrails(slug))]);
  if (!trail) notFound();

  const images = [trail.cover_image, ...trail.gallery].filter((x): x is string => !!x);
  const credit = creditFor(trail.cover_image);
  const place = [trail.village, trail.region?.name].filter(Boolean).join(", ");
  const { lat, lng } = trail.location;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const osm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;

  const stats = [
    { icon: Route, label: "Distance", value: formatDistance(trail.distance_km) },
    { icon: Clock, label: "Time", value: formatDuration(trail.duration_minutes) },
    trail.elevation_gain_m ? { icon: Mountain, label: "Elevation gain", value: `${trail.elevation_gain_m} m` } : null,
    trail.max_altitude_m ? { icon: MountainSnow, label: "Highest point", value: `${trail.max_altitude_m.toLocaleString("en")} m` } : null,
    { icon: Signpost, label: "Route", value: ROUTE_TYPE[trail.route_type] },
  ].filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <article className="pb-10">
      {/* Header */}
      <div className="container-page pt-6">
        <Link href="/trails" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="size-4" /> All trails
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <DifficultyBadge difficulty={trail.difficulty} />
              <Rating value={trail.rating} count={trail.reviews_count} className="text-ink-700" />
            </div>
            <h1 className="font-display-tight mt-3 text-4xl font-semibold text-forest-900 sm:text-6xl">{trail.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 font-semibold text-ink-500">
              <MapPin className="size-4" /> {place}
            </p>
          </div>
          <ShareButton title={trail.name} />
        </div>
      </div>

      {/* Gallery */}
      <div className="container-page mt-6">
        <div className={cn("grid gap-2 overflow-hidden rounded-[1.5rem]", images.length > 1 && "sm:grid-cols-[2fr_1fr]")}>
          <div className="relative aspect-[16/10] bg-sand-200 sm:aspect-auto sm:min-h-[26rem]">
            {images[0] && <Image src={imageUrl(images[0])!} alt={trail.name} fill priority sizes="(min-width:640px) 66vw, 100vw" className="object-cover" />}
            {credit && (
              <a href={credit.source} target="_blank" rel="noreferrer" className="absolute right-2 bottom-2 rounded-full bg-black/45 px-2.5 py-1 text-[0.65rem] font-medium text-white/90 backdrop-blur hover:bg-black/60">
                Photo: {credit.author} · {credit.license}
              </a>
            )}
          </div>
          {images.length > 1 && (
            <div className="hidden gap-2 sm:grid">
              {images.slice(1, 3).map((src) => (
                <div key={src} className="relative min-h-40 bg-sand-200">
                  <Image src={imageUrl(src)!} alt="" fill sizes="33vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="container-page mt-6">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] bg-sand-200 ring-1 ring-sand-200 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 bg-white p-4 sm:p-5">
              <Icon className="size-5 shrink-0 text-forest-600" />
              <div>
                <dt className="text-[0.65rem] font-bold tracking-[0.14em] text-ink-500 uppercase">{label}</dt>
                <dd className="font-display-tight text-xl font-semibold text-ink-900">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="container-page mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Main column */}
        <div className="space-y-12">
          <section>
            <h2 className="font-display-tight text-2xl font-semibold text-forest-900">Overview</h2>
            <p className="mt-3 text-lg font-medium text-ink-900">{trail.summary}</p>
            <div className="mt-4 space-y-4 leading-relaxed text-ink-700">
              {trail.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {trail.features.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {trail.features.map((f) => (
                  <li key={f}>
                    <Link href={`/trails?feature=${f}`} className="inline-block rounded-full bg-moss-100 px-3 py-1.5 text-sm font-bold text-forest-800 hover:bg-moss-200">
                      {FEATURE_LABEL[f] ?? f}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {trail.waypoints.length > 0 && (
            <section>
              <h2 className="font-display-tight text-2xl font-semibold text-forest-900">Along the way</h2>
              <ol className="mt-5 space-y-0">
                {trail.waypoints.map((w, i) => {
                  const last = i === trail.waypoints.length - 1;
                  return (
                    <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                      {!last && <span className="absolute top-7 bottom-0 left-[0.9rem] w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--color-sand-300)_0_6px,transparent_6px_10px)]" />}
                      <span className={cn("relative grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold", i === 0 || last ? "bg-forest-800 text-sand-50" : "bg-white text-forest-800 ring-2 ring-forest-600")}>
                        {i + 1}
                      </span>
                      <span className="pt-0.5 font-semibold text-ink-900">{w}</span>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {trail.best_months.length > 0 && (
            <section>
              <h2 className="font-display-tight flex items-center gap-2 text-2xl font-semibold text-forest-900">
                <CalendarDays className="size-5 text-forest-600" /> Best time to go
              </h2>
              <div className="mt-4 grid grid-cols-12 gap-1">
                {MONTHS.map((m, i) => {
                  const good = trail.best_months.includes(i + 1);
                  return (
                    <div key={i} title={MONTH_NAMES[i]} className="text-center">
                      <div className={cn("h-10 rounded-md", good ? "bg-forest-600" : "bg-sand-200")} />
                      <span className={cn("mt-1 block text-xs font-bold", good ? "text-forest-800" : "text-ink-400")}>{m}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-end justify-between">
              <h2 className="font-display-tight text-2xl font-semibold text-forest-900">Reviews</h2>
              <Rating value={trail.rating} count={trail.reviews_count} className="text-ink-700" />
            </div>
            {trail.reviews.length === 0 ? (
              <p className="mt-4 text-ink-500">No reviews yet.</p>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {trail.reviews.map((r) => (
                  <li key={r.id} className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-sand-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2.5">
                        <span className="grid size-9 place-items-center rounded-full bg-sand-200 text-sm font-bold text-ink-700">{r.author_name[0]}</span>
                        <span>
                          <span className="block text-sm font-bold">{r.author_name}</span>
                          {r.hiked_on && (
                            <span className="block text-xs text-ink-500">
                              Hiked {new Date(r.hiked_on).toLocaleDateString("en", { month: "long", year: "numeric" })}
                            </span>
                          )}
                        </span>
                      </span>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-700">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] ring-1 ring-sand-200">
            <TrailMap
              trails={[{ slug: trail.slug, name: trail.name, difficulty: trail.difficulty, location: trail.location, cover_image: trail.cover_image, region: trail.region?.name, distance_km: trail.distance_km }]}
              focusZoom={11}
              className="h-56"
            />
            <div className="space-y-3 p-5">
              <p className="text-xs font-bold tracking-[0.14em] text-ink-500 uppercase">Trailhead</p>
              <p className="font-mono text-sm text-ink-700">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
              <a href={directions} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-forest-800 px-4 py-3 text-sm font-bold text-sand-50 transition hover:bg-forest-900">
                <Navigation className="size-4" /> Get directions
              </a>
              <a href={osm} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-sand-100 px-4 py-3 text-sm font-bold text-ink-900 transition hover:bg-sand-200">
                <ExternalLink className="size-4" /> Open in OpenStreetMap
              </a>
              {trail.offline_map && (
                <p className="flex items-center gap-2 rounded-xl bg-moss-100 px-3 py-2 text-xs font-bold text-forest-800">
                  <Download className="size-4" /> Patchy signal — save an offline map before you go
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] bg-forest-900 p-5 text-sand-100">
            <p className="font-display-tight text-lg font-semibold text-sand-50">{DIFFICULTY[trail.difficulty].blurb}</p>
            <p className="mt-2 text-sm text-sand-200/85">
              Mountain weather changes fast. Tell someone your plan, carry water and a warm layer, and turn back if conditions worsen.
            </p>
            <Link href="/guides" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-moss-200 hover:text-white">
              <Users className="size-4" /> Hike with a local guide
            </Link>
          </div>
        </aside>
      </div>

      {nearby && nearby.length > 0 && (
        <section className="container-page mt-20">
          <h2 className="font-display-tight mb-6 text-3xl font-semibold text-forest-900">More trails nearby</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {nearby.map((t) => <TrailCard key={t.slug} trail={t} />)}
          </div>
        </section>
      )}
    </article>
  );
}
