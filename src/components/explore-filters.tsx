"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { RegionMap } from "./region-map";
import { Dropdown } from "./dropdown";
import { fill } from "@/i18n/config";
import { DIFFICULTIES, DIFFICULTY_STYLE, DURATIONS, FEATURES, PLACE_TYPES, cn } from "@/lib/format";
import type { Region } from "@/lib/types";

type Mode = "trails" | "places";

export function ExploreFilters({ mode, regions, total }: { mode: Mode; regions: Region[]; total: number | null }) {
  const { dict } = useI18n();
  const e = dict.explore;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const multi = (key: string) => params.getAll(key);
  const chipKey = mode === "trails" ? "feature" : "type";
  const activeCount = multi("difficulty").length + multi(chipKey).length + (params.get("region") ? 1 : 0) + (params.get("max_duration") ? 1 : 0);

  function update(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }
  const toggle = (key: string, value: string) =>
    update((p) => {
      const values = p.getAll(key);
      p.delete(key);
      (values.includes(value) ? values.filter((v) => v !== value) : [...values, value]).forEach((v) => p.append(key, v));
    });
  const set = (key: string, value: string | null) => update((p) => (value ? p.set(key, value) : p.delete(key)));

  useEffect(() => {
    if ((params.get("q") ?? "") === q) return;
    const id = setTimeout(() => set("q", q.trim()), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const sorts = mode === "trails"
    ? [["", e.sortPopular], ["rating", e.sortRating], ["distance", e.sortDistance], ["duration", e.sortDuration], ["name", e.sortName]]
    : [["", e.sortPopular], ["elevation", e.sortElevation], ["name", e.sortName]];

  const countLabel = total === null ? null : mode === "trails"
    ? total === 1 ? e.trailsCountOne : fill(e.trailsCount, { count: total })
    : total === 1 ? e.placesCountOne : fill(e.placesCount, { count: total });

  return (
    <div className="relative">
      {pending && <div className="absolute inset-x-0 -top-2 h-0.5 animate-pulse bg-pomegranate-500" />}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label className="relative flex min-w-0 flex-1 basis-60 items-center">
          <Search className="pointer-events-none absolute left-4 size-4 text-ink-500" />
          <input
            type="search"
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
            placeholder={mode === "trails" ? e.searchTrails : e.searchPlaces}
            className="h-11 w-full rounded-full bg-white pr-4 pl-10 text-sm font-medium shadow-sm ring-1 ring-sand-200 outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-forest-600"
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold ring-1 transition lg:hidden",
            open || activeCount ? "bg-forest-900 text-sand-50 ring-forest-900" : "bg-white text-ink-900 ring-sand-200",
          )}
        >
          <SlidersHorizontal className="size-4" />
          {e.filters}{activeCount ? ` · ${activeCount}` : ""}
        </button>
        <Dropdown
          label={e.sort}
          value={params.get("sort") ?? ""}
          onChange={(v) => set("sort", v)}
          options={sorts.map(([value, label]) => ({ value, label }))}
          className="h-11 rounded-full bg-white px-4 text-sm font-bold shadow-sm ring-1 ring-sand-200"
        />
      </div>

      <div className={cn("mt-3 flex-col gap-3 lg:flex", open ? "flex" : "hidden")}>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            label={e.pickRegion}
            value={params.get("region") ?? ""}
            onChange={(v) => set("region", v)}
            options={[{ value: "", label: e.allRegions }, ...regions.filter((r) => r.hiking_advised).map((r) => ({ value: r.slug, label: r.name }))]}
            className={chip(!!params.get("region"))}
          />
          <button type="button" onClick={() => setShowMap((s) => !s)} aria-expanded={showMap} className={chip(showMap)}>
            <MapIcon className="size-3.5" /> {showMap ? e.hideRegionMap : e.showRegionMap}
          </button>
          {mode === "trails" && (
            <>
              <Dropdown
                label={dict.home.searchDuration}
                value={params.get("max_duration") ?? ""}
                onChange={(v) => set("max_duration", v)}
                options={[{ value: "", label: e.anyDuration }, ...DURATIONS.map((d) => ({ value: d, label: dict.duration[d] }))]}
                className={chip(!!params.get("max_duration"))}
              />
              <span className="mx-1 hidden h-6 w-px bg-sand-300 sm:block" />
              {DIFFICULTIES.map((d) => (
                <button key={d} type="button" onClick={() => toggle("difficulty", d)} aria-pressed={multi("difficulty").includes(d)} className={chip(multi("difficulty").includes(d))}>
                  <span className="size-2 rounded-full" style={{ background: DIFFICULTY_STYLE[d].color }} />
                  {dict.difficulty[d]}
                </button>
              ))}
            </>
          )}
        </div>
        {/* py-1/-my-1: overflow-x:auto also clips vertically, which cut off the chips' ring shadows. */}
        <div className="no-scrollbar -mx-4 -my-1 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {(mode === "trails" ? FEATURES : PLACE_TYPES).map((value) => {
            const label = mode === "trails" ? dict.feature[value as keyof typeof dict.feature] : dict.placeTypePlural[value as keyof typeof dict.placeTypePlural];
            const on = multi(chipKey).includes(value);
            return (
              <button key={value} type="button" onClick={() => toggle(chipKey, value)} aria-pressed={on} className={cn(chip(on), "shrink-0")}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {showMap && (
        <div className="mt-4 max-w-2xl">
          <RegionMap regions={regions} active={params.get("region")} onSelect={(slug) => set("region", slug)} compact />
        </div>
      )}

      <div className="mt-4 flex items-center gap-3 text-sm text-ink-500">
        {countLabel && <span className="font-semibold text-ink-900">{countLabel}</span>}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => update((p) => ["region", "difficulty", "feature", "type", "max_duration", "q"].forEach((k) => p.delete(k)))}
            className="inline-flex items-center gap-1 font-bold text-pomegranate-600 hover:text-pomegranate-700"
          >
            <X className="size-3.5" /> {dict.common.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return cn(
    "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full pl-3.5 pr-3.5 text-[0.8rem] font-bold ring-1 transition outline-none",
    active ? "bg-forest-800 text-sand-50 ring-forest-800" : "bg-white text-ink-700 ring-sand-200 hover:ring-sand-400",
  );
}
