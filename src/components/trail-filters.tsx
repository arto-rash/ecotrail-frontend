"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { DIFFICULTY, DURATION_FILTERS, FEATURE_LABEL, cn } from "@/lib/format";
import type { Region } from "@/lib/types";

const SORTS = [
  { value: "", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "distance", label: "Shortest" },
  { value: "duration", label: "Quickest" },
  { value: "name", label: "A–Z" },
];

export function TrailFilters({ regions, total }: { regions: Region[]; total: number | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const difficulties = params.getAll("difficulty");
  const features = params.getAll("feature");
  const activeCount = difficulties.length + features.length + (params.get("region") ? 1 : 0) + (params.get("max_duration") ? 1 : 0);

  function update(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  function toggle(key: string, value: string) {
    update((p) => {
      const values = p.getAll(key);
      p.delete(key);
      (values.includes(value) ? values.filter((v) => v !== value) : [...values, value]).forEach((v) => p.append(key, v));
    });
  }

  function set(key: string, value: string) {
    update((p) => (value ? p.set(key, value) : p.delete(key)));
  }

  // Debounced free-text search.
  useEffect(() => {
    if ((params.get("q") ?? "") === q) return;
    const id = setTimeout(() => set("q", q.trim()), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="relative">
      {pending && <div className="absolute inset-x-0 -top-px h-0.5 animate-pulse bg-pomegranate-500" />}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label className="relative flex min-w-0 flex-1 basis-60 items-center">
          <Search className="pointer-events-none absolute left-4 size-4 text-ink-500" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search trails, villages, regions…"
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
          Filters{activeCount ? ` · ${activeCount}` : ""}
        </button>
        <select
          value={params.get("sort") ?? ""}
          onChange={(e) => set("sort", e.target.value)}
          aria-label="Sort"
          className="h-11 cursor-pointer rounded-full bg-white px-4 text-sm font-bold shadow-sm ring-1 ring-sand-200 outline-none"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className={cn("mt-3 flex-col gap-3 lg:flex", open ? "flex" : "hidden")}>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={params.get("region") ?? ""}
            onChange={(e) => set("region", e.target.value)}
            aria-label="Region"
            className={chip(!!params.get("region"))}
          >
            <option value="">All regions</option>
            {regions.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
          </select>
          <select
            value={params.get("max_duration") ?? ""}
            onChange={(e) => set("max_duration", e.target.value)}
            aria-label="Duration"
            className={chip(!!params.get("max_duration"))}
          >
            <option value="">Any duration</option>
            {DURATION_FILTERS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <span className="mx-1 hidden h-6 w-px bg-sand-300 sm:block" />
          {Object.entries(DIFFICULTY).map(([value, d]) => (
            <button key={value} type="button" onClick={() => toggle("difficulty", value)} aria-pressed={difficulties.includes(value)} className={chip(difficulties.includes(value))}>
              <span className="size-2 rounded-full" style={{ background: d.color }} />
              {d.label}
            </button>
          ))}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {Object.entries(FEATURE_LABEL).map(([value, label]) => (
            <button key={value} type="button" onClick={() => toggle("feature", value)} aria-pressed={features.includes(value)} className={cn(chip(features.includes(value)), "shrink-0")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm text-ink-500">
        {total !== null && (
          <span>
            <b className="text-ink-900">{total}</b> {total === 1 ? "trail" : "trails"}
          </span>
        )}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => update((p) => ["region", "difficulty", "feature", "max_duration", "q"].forEach((k) => p.delete(k)))}
            className="inline-flex items-center gap-1 font-bold text-pomegranate-600 hover:text-pomegranate-700"
          >
            <X className="size-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return cn(
    "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[0.8rem] font-bold ring-1 transition outline-none",
    active ? "bg-forest-800 text-sand-50 ring-forest-800" : "bg-white text-ink-700 ring-sand-200 hover:ring-sand-400",
  );
}
