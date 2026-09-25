import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreView } from "@/components/explore-view";
import { TrailFilters } from "@/components/trail-filters";
import { getRegions, getTrails, safe } from "@/lib/data";

export const metadata: Metadata = {
  title: "Explore trails",
  description: "Search and filter hiking trails across Azerbaijan by region, difficulty, duration and features.",
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export default async function TrailsPage({ searchParams }: PageProps<"/trails">) {
  const sp = await searchParams;
  const [trails, regions] = await Promise.all([
    safe(
      getTrails({
        q: one(sp.q),
        region: one(sp.region),
        difficulty: many(sp.difficulty),
        feature: many(sp.feature),
        max_duration: one(sp.max_duration),
        sort: one(sp.sort),
      }),
    ),
    safe(getRegions()),
  ]);

  return (
    <div className="container-page pt-8 lg:pt-10">
      <div className="mb-6">
        <h1 className="font-display-tight text-4xl font-semibold text-forest-900 sm:text-5xl">Explore trails</h1>
        <p className="mt-2 text-ink-700">Waterfalls, alpine lakes and highland villages — filter to find your kind of day out.</p>
      </div>
      <div className="mb-6">
        <Suspense>
          <TrailFilters regions={regions ?? []} total={trails?.meta.total ?? null} />
        </Suspense>
      </div>
      {trails ? (
        <Suspense>
          <ExploreView trails={trails.data} />
        </Suspense>
      ) : (
        <p className="rounded-[var(--radius-card)] bg-pomegranate-100 p-6 font-semibold text-pomegranate-700">
          We couldn&apos;t reach the trail service. Please try again in a moment.
        </p>
      )}
    </div>
  );
}
