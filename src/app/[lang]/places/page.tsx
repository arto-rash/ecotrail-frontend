import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { ExploreFilters } from "@/components/explore-filters";
import { ExploreShell } from "@/components/explore-shell";
import { PlaceCard } from "@/components/place-card";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getPlaces, getRegions, safe } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.explore.placesTab, description: dict.explore.placesIntro };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export default async function PlacesPage({ searchParams }: PageProps<"/[lang]/places">) {
  const [locale, dict, sp] = await Promise.all([getLocale(), getDictionary(), searchParams]);
  const [places, regions] = await Promise.all([
    safe(getPlaces({ q: one(sp.q), region: one(sp.region), type: many(sp.type), sort: one(sp.sort) })),
    safe(getRegions()),
  ]);

  return (
    <ExploreShell
      title={dict.explore.title}
      intro={dict.explore.placesIntro}
      tabs={[
        { href: localePath(locale, "/trails"), label: dict.explore.trailsTab, active: false },
        { href: localePath(locale, "/places"), label: dict.explore.placesTab, active: true },
      ]}
    >
      <div className="mb-8">
        <Suspense>
          <ExploreFilters mode="places" regions={regions ?? []} total={places?.meta.total ?? null} />
        </Suspense>
      </div>
      {!places ? (
        <p className="rounded-[var(--radius-card)] bg-pomegranate-100 p-6 font-semibold text-pomegranate-700">{dict.common.unavailable}</p>
      ) : places.data.length === 0 ? (
        <EmptyState title={dict.common.noResults} hint={dict.common.noResultsHint} cta={dict.explore.shareMissing} href={localePath(locale, "/trails/new")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {places.data.map((p, i) => <PlaceCard key={p.slug} place={p} priority={i < 4} />)}
        </div>
      )}
    </ExploreShell>
  );
}
