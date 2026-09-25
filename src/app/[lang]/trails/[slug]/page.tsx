import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Download, ExternalLink, Gauge, Mountain, MountainSnow, Navigation, Route, Signpost, Users } from "lucide-react";
import { CoverImage, PhotoCredit } from "@/components/cover-image";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { ElevationProfile } from "@/components/elevation-profile";
import { GuideAvatar } from "@/components/guide-avatar";
import { LocationLink } from "@/components/location-link";
import { Reviews } from "@/components/reviews";
import { ShareButton } from "@/components/share-button";
import { SourcesList } from "@/components/sources-list";
import { TrailCard } from "@/components/trail-card";
import { TrailMap } from "@/components/trail-map";
import { fill, localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { PUBLIC_API_URL } from "@/lib/api";
import { getNearbyTrails, getTrail, safe } from "@/lib/data";
import { formatDistance, formatDuration, formatMetres } from "@/lib/format";
import { googleDirectionsUrl, googleMapsUrl, osmUrl } from "@/lib/maps";
import type { MapData, TrailDetail } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/trails/[slug]">): Promise<Metadata> {
  const trail = await safe(getTrail((await params).slug));
  if (!trail) return {};
  return {
    title: trail.name,
    description: trail.summary ?? undefined,
    openGraph: { images: trail.image ? [trail.image.url] : [] },
    alternates: { languages: { az: `/az/trails/${trail.slug}`, en: `/en/trails/${trail.slug}` } },
  };
}

function mapDataFor(trail: TrailDetail): Partial<MapData> {
  return {
    trails: {
      type: "FeatureCollection",
      features: trail.route
        ? [{
            type: "Feature",
            geometry: trail.route,
            properties: {
              kind: "trail", slug: trail.slug, name: trail.name, difficulty: trail.difficulty, distance_km: trail.distance_km,
              duration_minutes: trail.duration_minutes, region: trail.region?.slug ?? null, lat: trail.location.lat, lng: trail.location.lng, image: trail.image?.url ?? null,
            },
          }]
        : [],
    },
    places: {
      type: "FeatureCollection",
      features: trail.places.map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.location.lng, p.location.lat] },
        properties: { kind: "place", slug: p.slug, name: p.name, type: p.type, ele_m: p.ele_m, region: p.region?.slug ?? null, image: p.image?.url ?? null },
      })),
    },
  };
}

export default async function TrailPage({ params }: PageProps<"/[lang]/trails/[slug]">) {
  const { slug } = await params;
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const [trail, nearby] = await Promise.all([getTrail(slug), safe(getNearbyTrails(slug))]);
  if (!trail) notFound();

  const t = dict.trail;
  // Older cached API responses (before guide profiles) have no `guides`.
  const trailGuides = trail.guides ?? [];
  const est = trail.stats_estimated ? ` ${dict.common.est}` : "";
  const { lat, lng } = trail.location;
  const place = [trail.village, trail.district?.name, trail.region?.name].filter(Boolean).join(", ");
  const routeType = dict.routeType[trail.route_type].toLowerCase();
  const fallbackSummary = trail.ascent_m && trail.max_ele_m
    ? fill(t.generatedSummary, {
        distance: formatDistance(trail.distance_km, locale, dict),
        routeType,
        district: trail.district?.name ?? trail.region?.name ?? (locale === "az" ? "Azərbaycan" : "Azerbaijan"),
        ascent: formatMetres(trail.ascent_m, locale, dict),
        highest: formatMetres(trail.max_ele_m, locale, dict),
      })
    : fill(t.generatedSummaryFlat, { distance: formatDistance(trail.distance_km, locale, dict), routeType, district: trail.district?.name ?? (locale === "az" ? "Azərbaycan" : "Azerbaijan") });

  const stats = [
    { icon: Route, label: t.distance, value: formatDistance(trail.distance_km, locale, dict), note: trail.route_type === "point_to_point" ? dict.common.oneWay : null },
    { icon: Clock, label: t.time, value: formatDuration(trail.duration_minutes, dict) + est, note: null, estimated: trail.stats_estimated },
    trail.ascent_m !== null ? { icon: Mountain, label: t.ascent, value: `+${formatMetres(trail.ascent_m, locale, dict)}${est}`, note: null, estimated: trail.stats_estimated } : null,
    trail.max_ele_m !== null ? { icon: MountainSnow, label: t.highest, value: formatMetres(trail.max_ele_m, locale, dict) + est, note: null, estimated: trail.stats_estimated } : null,
    { icon: Signpost, label: t.route, value: dict.routeType[trail.route_type], note: null },
  ].filter((s): s is NonNullable<typeof s> => !!s);

  const basis = trail.difficulty_basis === "sac_scale" ? t.difficultyBasisSac : trail.difficulty_basis === "effort" ? t.difficultyBasisEffort : t.difficultyBasisSubmitter;

  return (
    <article className="pb-10">
      <div className="container-page pt-6">
        <Link href={localePath(locale, "/trails")} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="size-4" /> {t.allTrails}
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={trail.difficulty} />
              {trail.duration_minutes > 600 && <span className="rounded-full bg-forest-900 px-2.5 py-1 text-xs font-bold text-sand-50">{t.multiDay}</span>}
              {trail.network === "tct" && <span className="rounded-full bg-sand-200 px-2.5 py-1 text-xs font-bold text-ink-700">{t.partOfTct}</span>}
            </div>
            <h1 className="font-display-tight mt-3 text-4xl font-semibold text-forest-900 sm:text-6xl">{trail.name}</h1>
            <LocationLink label={place} lat={lat} lng={lng} className="mt-2 font-semibold text-ink-500 hover:text-forest-800" />
          </div>
          <ShareButton title={trail.name} />
        </div>
      </div>

      <div className="container-page mt-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-forest-900 sm:aspect-[21/9]">
          <CoverImage image={trail.image} kind="trail" alt={trail.name} sizes="100vw" priority />
          {trail.image && <PhotoCredit image={trail.image} prefix={dict.common.photo} className="absolute right-2 bottom-2" />}
        </div>
      </div>

      <div className="container-page mt-6">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] bg-sand-200 ring-1 ring-sand-200 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(({ icon: Icon, label, value, note, ...rest }) => (
            <div key={label} className="flex items-center gap-3 bg-white p-4 sm:p-5" title={"estimated" in rest && rest.estimated ? dict.common.estimatedTooltip : undefined}>
              <Icon className="size-5 shrink-0 text-forest-600" />
              <div>
                <dt className="text-[0.65rem] font-bold tracking-[0.14em] text-ink-500 uppercase">{label}</dt>
                <dd className="font-display-tight text-xl font-semibold text-ink-900">{value}</dd>
                {note && <dd className="text-xs text-ink-500">{note}</dd>}
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="container-page mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-12">
          <section>
            <h2 className="font-display-tight text-2xl font-semibold text-forest-900">{t.overview}</h2>
            <p className="mt-3 text-lg font-medium text-ink-900">{trail.summary ?? fallbackSummary}</p>
            {trail.description && (
              <div className="mt-4 space-y-4 leading-relaxed text-ink-700">
                {trail.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
            {trail.segments > 1 && <p className="mt-4 text-sm text-ink-500">{fill(t.segmentsNote, { count: trail.segments })}</p>}
            {trail.features.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {trail.features.map((f) => (
                  <li key={f}>
                    <Link href={localePath(locale, `/trails?feature=${f}`)} className="inline-block rounded-full bg-moss-100 px-3 py-1.5 text-sm font-bold text-forest-800 hover:bg-moss-200">
                      {dict.feature[f as keyof typeof dict.feature] ?? f}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {trail.elevation_profile.length > 1 && (
            <section>
              <h2 className="font-display-tight text-2xl font-semibold text-forest-900">{t.profile}</h2>
              <div className="mt-4 rounded-[var(--radius-card)] bg-white p-3 ring-1 ring-sand-200 sm:p-4">
                <ElevationProfile profile={trail.elevation_profile} />
              </div>
              <p className="mt-2 text-xs text-ink-500">{t.profileNote}</p>
            </section>
          )}

          {trail.places.length > 0 && (
            <section>
              <h2 className="font-display-tight text-2xl font-semibold text-forest-900">{t.onTheWay}</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {trail.places.map((p) => (
                  <li key={p.slug}>
                    <Link href={localePath(locale, `/places/${p.slug}`)} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-sand-200 transition hover:ring-forest-600">
                      <span>
                        <span className="block font-bold text-ink-900">{p.name}</span>
                        <span className="block text-xs font-semibold text-ink-500">{dict.placeType[p.type]}{p.ele_m !== null ? ` · ${formatMetres(p.ele_m, locale, dict)}` : ""}</span>
                      </span>
                      <ArrowLeft className="size-4 rotate-180 text-ink-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex gap-4 rounded-[var(--radius-card)] bg-sand-100 p-5">
            <Gauge className="mt-0.5 size-5 shrink-0 text-forest-700" />
            <div>
              <p className="font-bold text-ink-900">{t.bestFor}: {dict.difficulty[trail.difficulty]} — {dict.difficultyBlurb[trail.difficulty]}</p>
              <p className="mt-1 text-sm text-ink-700">{basis}</p>
              {trail.stats_estimated && <p className="mt-1 text-sm text-ink-500">{dict.common.estimatedTooltip}</p>}
            </div>
          </section>

          <Reviews kind="trails" slug={trail.slug} initial={trail.reviews} rating={trail.rating} />

          <SourcesList title={dict.common.sources} sources={trail.sources} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] ring-1 ring-sand-200">
            <TrailMap data={mapDataFor(trail)} className="h-72" />
            <div className="space-y-3 p-5">
              <p className="text-xs font-bold tracking-[0.14em] text-ink-500 uppercase" title={t.startEndNote}>{t.trailhead}</p>
              <p className="font-mono text-sm text-ink-700">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
              <a href={googleDirectionsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-forest-800 px-4 py-3 text-sm font-bold text-sand-50 transition hover:bg-forest-900">
                <Navigation className="size-4" /> {t.directionsToStart}
              </a>
              {trail.route && (
                <a href={`${PUBLIC_API_URL}/trails/${encodeURIComponent(trail.slug)}/gpx`} download className="flex w-full items-center justify-center gap-2 rounded-full bg-moss-100 px-4 py-3 text-sm font-bold text-forest-800 transition hover:bg-moss-200">
                  <Download className="size-4" /> {t.downloadGpx}
                </a>
              )}
              <div className="grid grid-cols-2 gap-2">
                <a href={googleMapsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-full bg-sand-100 px-3 py-2.5 text-xs font-bold text-ink-900 transition hover:bg-sand-200">
                  <ExternalLink className="size-3.5" /> Google Maps
                </a>
                <a href={trail.osm_relation_id ? `https://www.openstreetmap.org/relation/${trail.osm_relation_id}` : osmUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-full bg-sand-100 px-3 py-2.5 text-xs font-bold text-ink-900 transition hover:bg-sand-200">
                  <ExternalLink className="size-3.5" /> OpenStreetMap
                </a>
              </div>
              {trail.route && <p className="text-xs leading-relaxed text-ink-500">{t.gpxHint}</p>}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] bg-forest-900 p-5 text-sand-100">
            <p className="font-display-tight text-lg font-semibold text-sand-50">{dict.difficultyBlurb[trail.difficulty]}</p>
            <p className="mt-2 text-sm text-sand-200/85">{t.safety}</p>
            {trailGuides.length === 0 && (
              <Link href={localePath(locale, `/guides${trail.region ? `?region=${trail.region.slug}` : ""}`)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-moss-200 hover:text-white">
                <Users className="size-4" /> {t.withGuide}
              </Link>
            )}
          </div>

          {trailGuides.length > 0 && (
            <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-sand-200">
              <p className="font-display-tight text-lg font-semibold text-forest-900">{dict.guides.onTrail}</p>
              <p className="text-sm text-ink-500">{dict.guides.onTrailHint}</p>
              <ul className="mt-3 space-y-2">
                {trailGuides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={localePath(locale, `/guides/${guide.slug}`)} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-sand-100">
                      <GuideAvatar name={guide.name} photo={guide.photo} className="size-11" textClassName="text-sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-ink-900">{guide.name}</span>
                        <span className="block text-xs text-ink-500">
                          {guide.price_from_azn !== null ? `${dict.guides.from} ${guide.price_from_azn} ₼ ${guide.price_unit?.label ?? ""}` : guide.kind === "agency" ? dict.guides.agency : dict.guides.guide}
                          {guide.is_sample ? ` · ${dict.guides.sample}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {nearby && nearby.length > 0 && (
        <section className="container-page mt-20">
          <h2 className="font-display-tight mb-6 text-3xl font-semibold text-forest-900">{t.nearby}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {nearby.map((n) => <TrailCard key={n.slug} trail={n} />)}
          </div>
        </section>
      )}
    </article>
  );
}
