"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Layers, MousePointerClick, TriangleAlert, X } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { REGION_SHAPES, RegionMap } from "./region-map";
import { PLACE_COLORS, TrailMap, type Bbox } from "./trail-map";
import { fill, localePath } from "@/i18n/config";
import { DIFFICULTY_STYLE, cn, formatDistance, formatDuration, formatMetres } from "@/lib/format";
import type { MapData, Region } from "@/lib/types";

type Mode = "regions" | "terrain";

export function MapExplorer({ data, regions, initialRegion }: { data: MapData; regions: Region[]; initialRegion: string | null }) {
  const { locale, dict } = useI18n();
  const m = dict.map;
  const [mode, setMode] = useState<Mode>(initialRegion ? "terrain" : "regions");
  const [region, setRegion] = useState<string | null>(initialRegion);
  const [show, setShow] = useState({ trails: true, places: true });
  const [bounds, setBounds] = useState<Bbox | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const regionInfo = region ? regions.find((r) => r.slug === region) : null;
  const fit = useMemo<Bbox | null>(() => (region ? (REGION_SHAPES[region]?.bounds as Bbox) : null), [region]);

  // Only draw what belongs to the chosen region, if any.
  const visibleData = useMemo<MapData>(() => {
    const inRegion = <T extends { properties: { region: string | null } }>(fs: T[]) => (region ? fs.filter((f) => f.properties.region === region) : fs);
    return {
      trails: { ...data.trails, features: inRegion(data.trails.features) },
      places: { ...data.places, features: inRegion(data.places.features) },
    };
  }, [data, region]);

  const inView = useMemo(() => {
    const within = (lng: number, lat: number) => !bounds || (lng >= bounds[0] && lng <= bounds[2] && lat >= bounds[1] && lat <= bounds[3]);
    const trails = show.trails ? visibleData.trails.features.filter((f) => within(f.properties.lng, f.properties.lat)).map((f) => f.properties) : [];
    const places = show.places ? visibleData.places.features.filter((f) => within(...f.geometry.coordinates)).map((f) => f.properties) : [];
    return { trails, places };
  }, [visibleData, bounds, show]);

  function chooseRegion(slug: string | null) {
    setRegion(slug);
    if (slug) setMode("terrain");
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("region", slug);
    else url.searchParams.delete("region");
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="flex flex-col lg:h-[calc(100svh-4rem)] lg:flex-row">
      {/* Panel */}
      <aside className="order-2 flex flex-col border-sand-200 bg-sand-50 lg:order-1 lg:w-[23rem] lg:shrink-0 lg:border-r">
        <div className="space-y-4 border-b border-sand-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display-tight text-3xl font-extrabold text-forest-900">{m.title}</h1>
            <div className="inline-flex rounded-full bg-sand-200/70 p-1 text-sm font-bold" role="tablist">
              {(["regions", "terrain"] as const).map((v) => (
                <button key={v} role="tab" aria-selected={mode === v} onClick={() => setMode(v)} className={cn("rounded-full px-3.5 py-1.5 transition", mode === v ? "bg-white text-forest-900 shadow-sm" : "text-ink-500")}>
                  {v === "regions" ? m.regions : m.terrain}
                </button>
              ))}
            </div>
          </div>
          {mode === "terrain" && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Layers className="size-4 text-ink-500" />
              {(["trails", "places"] as const).map((k) => (
                <label key={k} className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-bold ring-1", show[k] ? "bg-forest-800 text-sand-50 ring-forest-800" : "bg-white text-ink-700 ring-sand-200")}>
                  <input type="checkbox" className="sr-only" checked={show[k]} onChange={(e) => setShow({ ...show, [k]: e.target.checked })} />
                  {k === "trails" ? m.trails : m.places}
                </label>
              ))}
            </div>
          )}
          {regionInfo && (
            <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 ring-1 ring-sand-200">
              <span className="font-bold text-forest-900">{regionInfo.name}</span>
              <button onClick={() => chooseRegion(null)} className="inline-flex items-center gap-1 text-xs font-bold text-pomegranate-600">
                <X className="size-3.5" /> {m.backToAll}
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[28rem] flex-1 overflow-y-auto p-4 lg:max-h-none">
          {regionInfo && !regionInfo.hiking_advised ? (
            <div className="rounded-2xl bg-pomegranate-100 p-4 text-sm text-pomegranate-700">
              <p className="flex items-center gap-2 font-bold"><TriangleAlert className="size-4" /> {m.notAdvisedTitle}</p>
              <p className="mt-1">{m.notAdvisedText}</p>
            </div>
          ) : mode === "regions" ? (
            <ul className="space-y-1">
              {regions.map((r) => (
                <li key={r.slug}>
                  <button
                    onClick={() => chooseRegion(r.slug)}
                    onMouseEnter={() => setActive(r.slug)}
                    onMouseLeave={() => setActive(null)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-sand-200/60"
                  >
                    <span className="font-semibold text-ink-900">{r.name}</span>
                    <span className="text-xs text-ink-500">
                      {r.hiking_advised ? `${fill(dict.regionMap.trails, { count: r.trails_count ?? 0 })} · ${fill(dict.regionMap.places, { count: r.places_count ?? 0 })}` : <TriangleAlert className="size-3.5 text-pomegranate-600" />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : inView.trails.length + inView.places.length === 0 ? (
            <p className="text-sm text-ink-500">{m.nothingInView}</p>
          ) : (
            <div className="space-y-5">
              {inView.trails.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold tracking-[0.16em] text-ink-500 uppercase">{m.trails} · {inView.trails.length}</p>
                  <ul className="space-y-1.5">
                    {inView.trails.map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={localePath(locale, `/trails/${t.slug}`)}
                          onMouseEnter={() => setActive(t.slug)}
                          onMouseLeave={() => setActive(null)}
                          className={cn("flex items-center gap-3 rounded-xl bg-white p-2.5 ring-1 transition", active === t.slug ? "ring-forest-600" : "ring-sand-200")}
                        >
                          <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: DIFFICULTY_STYLE[t.difficulty].color }} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink-900">{t.name}</span>
                            <span className="block text-xs text-ink-500">
                              {formatDistance(t.distance_km, locale, dict)} · {formatDuration(t.duration_minutes, dict)} · {dict.difficulty[t.difficulty]}
                            </span>
                          </span>
                          <ArrowRight className="size-4 text-ink-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {inView.places.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold tracking-[0.16em] text-ink-500 uppercase">{m.places} · {inView.places.length}</p>
                  <ul className="space-y-1.5">
                    {inView.places.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={localePath(locale, `/places/${p.slug}`)}
                          onMouseEnter={() => setActive(p.slug)}
                          onMouseLeave={() => setActive(null)}
                          className={cn("flex items-center gap-3 rounded-xl bg-white px-2.5 py-2 ring-1 transition", active === p.slug ? "ring-forest-600" : "ring-sand-200")}
                        >
                          <span className="size-3 shrink-0 rounded-full ring-2 ring-white" style={{ background: PLACE_COLORS[p.type] }} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink-900">{p.name}</span>
                            <span className="block text-xs text-ink-500">
                              {dict.placeType[p.type]}{p.ele_m !== null ? ` · ${formatMetres(p.ele_m, locale, dict)}` : ""}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="flex items-start gap-2 border-t border-sand-200 p-4 text-xs text-ink-500">
          <MousePointerClick className="size-4 shrink-0" /> {mode === "regions" ? m.regionHint : m.rightClickHint}
        </p>
      </aside>

      {/* Map area */}
      <div className="relative order-1 h-[62svh] flex-1 lg:order-2 lg:h-auto">
        {mode === "regions" ? (
          <div className="flex h-full items-center justify-center bg-sand-100 p-4 sm:p-8">
            <RegionMap regions={regions} active={active && REGION_SHAPES[active] ? active : region} onSelect={chooseRegion} className="w-full max-w-4xl" />
          </div>
        ) : (
          <TrailMap data={visibleData} show={show} fit={fit} activeSlug={active} onActiveChange={setActive} onBoundsChange={setBounds} className="h-full" />
        )}
      </div>
    </div>
  );
}
