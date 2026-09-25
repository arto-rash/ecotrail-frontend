"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { List, Map as MapIcon, SearchX } from "lucide-react";
import { TrailCard } from "./trail-card";
import { TrailMap } from "./trail-map";
import { cn } from "@/lib/format";
import type { MapTrail, Trail } from "@/lib/types";

export function ExploreView({ trails }: { trails: Trail[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const view = params.get("view") === "map" ? "map" : "list";

  const mapTrails: MapTrail[] = useMemo(
    () =>
      trails.map((t) => ({
        slug: t.slug,
        name: t.name,
        difficulty: t.difficulty,
        location: t.location,
        cover_image: t.cover_image,
        region: t.region?.name,
        distance_km: t.distance_km,
      })),
    [trails],
  );

  const toggleHref = (() => {
    const p = new URLSearchParams(params.toString());
    if (view === "map") p.delete("view");
    else p.set("view", "map");
    return `${pathname}${p.size ? `?${p}` : ""}`;
  })();

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6">
      <div className={cn("space-y-3 pb-6", view === "map" && "hidden lg:block")}>
        {trails.length === 0 ? (
          <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-sand-300 px-6 py-16 text-center">
            <SearchX className="size-10 text-ink-400" />
            <p className="mt-4 font-display-tight text-2xl font-semibold text-forest-900">No trails match those filters</p>
            <p className="mt-2 max-w-sm text-sm text-ink-500">Try widening the duration or removing a feature — or add the trail yourself.</p>
            <Link href="/trails/new" className="mt-6 rounded-full bg-forest-800 px-5 py-2.5 text-sm font-bold text-sand-50">Share a trail</Link>
          </div>
        ) : (
          trails.map((t, i) => <TrailCard key={t.slug} trail={t} variant="row" priority={i < 2} active={active === t.slug} onHover={setActive} />)
        )}
      </div>

      <div
        className={cn(
          "lg:sticky lg:top-20 lg:block lg:h-[calc(100svh-6rem)]",
          view === "map" ? "block h-[calc(100svh-15rem)] min-h-96" : "hidden",
        )}
      >
        <TrailMap trails={mapTrails} activeSlug={active} onActiveChange={setActive} className="h-full rounded-[var(--radius-card)] ring-1 ring-sand-200" />
      </div>

      <Link
        href={toggleHref}
        scroll={false}
        className="fixed bottom-24 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-sm font-bold text-sand-50 shadow-[var(--shadow-lift)] lg:hidden"
      >
        {view === "map" ? <><List className="size-4" /> Show list</> : <><MapIcon className="size-4" /> Show map</>}
      </Link>
    </div>
  );
}
