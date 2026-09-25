import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { ExploreFilters } from "@/components/explore-filters";
import { ExploreShell } from "@/components/explore-shell";
import { TrailCard } from "@/components/trail-card";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getRegions, getTrails, safe } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.explore.trailsTab, description: dict.explore.trailsIntro };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export default async function TrailsPage({ searchParams }: PageProps<"/[lang]/trails">) {
  const [locale, dict, sp] = await Promise.all([getLocale(), getDictionary(), searchParams]);
  const [trails, regions] = await Promise.all([
    safe(getTrails({ q: one(sp.q), region: one(sp.region), difficulty: many(sp.difficulty), feature: many(sp.feature), max_duration: one(sp.max_duration), sort: one(sp.sort) })),
    safe(getRegions()),
  ]);

  return (
    <ExploreShell
      title={dict.explore.title}
      intro={dict.explore.trailsIntro}
      tabs={[
        { href: localePath(locale, "/trails"), label: dict.explore.trailsTab, active: true },
        { href: localePath(locale, "/places"), label: dict.explore.placesTab, active: false },
      ]}
    >
      <div className="mb-8">
        <Suspense>
          <ExploreFilters mode="trails" regions={regions ?? []} total={trails?.meta.total ?? null} />
        </Suspense>
      </div>
      {!trails ? (
        <p className="rounded-[var(--radius-card)] bg-pomegranate-100 p-6 font-semibold text-pomegranate-700">{dict.common.unavailable}</p>
      ) : trails.data.length === 0 ? (
        <EmptyState title={dict.common.noResults} hint={dict.common.noResultsHint} cta={dict.explore.shareMissing} href={localePath(locale, "/trails/new")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trails.data.map((t, i) => <TrailCard key={t.slug} trail={t} priority={i < 3} />)}
        </div>
      )}
    </ExploreShell>
  );
}
