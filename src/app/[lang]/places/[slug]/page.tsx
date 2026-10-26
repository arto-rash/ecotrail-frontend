import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPinned, MountainSnow, Navigation, Tag } from "lucide-react";
import { CoverImage, PhotoCredit } from "@/components/cover-image";
import { LocationLink } from "@/components/location-link";
import { PlaceCard } from "@/components/place-card";
import { Reviews } from "@/components/reviews";
import { ShareButton } from "@/components/share-button";
import { SourcesList } from "@/components/sources-list";
import { TrailCard } from "@/components/trail-card";
import { TrailMap } from "@/components/trail-map";
import { fill, localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getNearbyPlaces, getPlace, safe } from "@/lib/data";
import { formatMetres } from "@/lib/format";
import { googleDirectionsUrl, googleMapsUrl } from "@/lib/maps";
import type { MapData, PlaceDetail } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/places/[slug]">): Promise<Metadata> {
  const place = await safe(getPlace((await params).slug));
  if (!place) return {};
  return {
    title: place.name,
    description: place.summary ?? undefined,
    openGraph: { images: place.image ? [place.image.url] : [] },
    alternates: { languages: { az: `/az/places/${place.slug}`, en: `/en/places/${place.slug}` } },
  };
}

function mapDataFor(place: PlaceDetail): Partial<MapData> {
  return {
    places: {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [place.location.lng, place.location.lat] },
        properties: { kind: "place", slug: place.slug, name: place.name, type: place.type, ele_m: place.ele_m, region: place.region?.slug ?? null, image: place.image?.url ?? null },
      }],
    },
  };
}

export default async function PlacePage({ params }: PageProps<"/[lang]/places/[slug]">) {
  const { slug } = await params;
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const [place, nearby] = await Promise.all([getPlace(slug), safe(getNearbyPlaces(slug))]);
  if (!place) notFound();

  const pl = dict.place;
  const { lat, lng } = place.location;
  const where = [place.district?.name, place.region?.name].filter(Boolean).join(", ");
  const typeLabel = dict.placeType[place.type];
  const ele = place.ele_m !== null ? `${place.ele_source === "srtm" ? "≈ " : ""}${formatMetres(place.ele_m, locale, dict)}` : null;
  const generated = fill(ele ? pl.generatedEle : pl.generated, {
    type: locale === "az" ? typeLabel.toLowerCase() : typeLabel,
    district: place.district?.name ?? "",
    region: place.region?.name ?? "",
    ele: ele ?? "",
  });
  const wikipedia = place.sources.find((s) => s.label.startsWith(`Wikipedia (${locale})`));

  const facts = [
    { icon: Tag, label: dict.place.about, value: typeLabel },
    ele ? { icon: MountainSnow, label: pl.elevation, value: ele, note: place.ele_source === "srtm" ? pl.elevationSrtm : null } : null,
    place.district ? { icon: MapPinned, label: pl.district, value: place.district.name } : null,
    place.region ? { icon: MapPinned, label: pl.region, value: place.region.name } : null,
  ].filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <article className="pb-10">
      <div className="container-page pt-6">
        <Link href={localePath(locale, "/places")} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="size-4" /> {pl.allPlaces}
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="rounded-full bg-moss-100 px-2.5 py-1 text-xs font-bold text-forest-800">{typeLabel}</span>
            <h1 className="font-display-tight mt-3 text-4xl font-extrabold text-forest-900 sm:text-6xl">{place.name}</h1>
            {place.summary && <p className="mt-1 text-ink-500">{place.summary}</p>}
            <LocationLink label={where} lat={lat} lng={lng} className="mt-2 font-semibold text-ink-500 hover:text-forest-800" />
          </div>
          <ShareButton title={place.name} />
        </div>
      </div>

      <div className="container-page mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-forest-900">
          <CoverImage image={place.image} kind={place.type} alt={place.name} sizes="(min-width:1024px) 66vw, 100vw" priority />
          {place.image ? (
            <PhotoCredit image={place.image} prefix={dict.common.photo} className="absolute right-2 bottom-2" />
          ) : (
            <span className="absolute right-3 bottom-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white/85">{pl.noPhoto}</span>
          )}
        </div>
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[var(--shadow-card)] ring-1 ring-sand-200">
          <TrailMap data={mapDataFor(place)} className="h-56" />
          <div className="space-y-3 p-5">
            <p className="font-mono text-sm text-ink-700">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
            <a href={googleDirectionsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-forest-800 px-4 py-3 text-sm font-bold text-sand-50 transition hover:bg-forest-900">
              <Navigation className="size-4" /> {dict.common.directions}
            </a>
            <a href={googleMapsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-sand-200">
              <ExternalLink className="size-4" /> {dict.common.openInGoogleMaps}
            </a>
          </div>
        </div>
      </div>

      <div className="container-page mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-12">
          <section>
            <h2 className="font-display-tight text-2xl font-extrabold text-forest-900">{pl.about}</h2>
            {place.description ? (
              <>
                <p className="mt-3 leading-relaxed text-ink-700">{place.description}</p>
                {wikipedia && (
                  <a href={wikipedia.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-forest-700 hover:underline">
                    {pl.fromWikipedia} <ExternalLink className="size-3.5" />
                  </a>
                )}
              </>
            ) : (
              <p className="mt-3 leading-relaxed text-ink-700">{generated}</p>
            )}
          </section>

          {place.trails.length > 0 && (
            <section>
              <h2 className="font-display-tight text-2xl font-extrabold text-forest-900">{pl.trailsHere}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {place.trails.map((t) => <TrailCard key={t.slug} trail={t} sizes="(min-width:640px) 33vw, 85vw" />)}
              </div>
            </section>
          )}

          <Reviews kind="places" slug={place.slug} initial={place.reviews} rating={place.rating} />
          <SourcesList title={dict.common.sources} sources={place.sources} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <dl className="divide-y divide-sand-200 rounded-[var(--radius-card)] bg-white ring-1 ring-sand-200">
            {facts.map(({ icon: Icon, label, value, ...rest }) => (
              <div key={label + value} className="flex items-start gap-3 p-4">
                <Icon className="mt-0.5 size-4 shrink-0 text-forest-600" />
                <div>
                  <dt className="text-[0.65rem] font-bold tracking-[0.14em] text-ink-500 uppercase">{label}</dt>
                  <dd className="font-semibold text-ink-900">{value}</dd>
                  {"note" in rest && rest.note && <dd className="text-xs text-ink-500">{rest.note}</dd>}
                </div>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {nearby && nearby.length > 0 && (
        <section className="container-page mt-20">
          <h2 className="font-display-tight mb-6 text-3xl font-extrabold text-forest-900">{pl.nearby}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((n) => <PlaceCard key={n.slug} place={n} />)}
          </div>
        </section>
      )}
    </article>
  );
}
