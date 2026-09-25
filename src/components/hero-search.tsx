"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { Dropdown } from "./dropdown";
import { localePath } from "@/i18n/config";
import { DIFFICULTIES, DIFFICULTY_STYLE, DURATIONS, cn } from "@/lib/format";
import type { Region } from "@/lib/types";

export function HeroSearch({ regions }: { regions: Region[] }) {
  const { locale, dict } = useI18n();
  const h = dict.home;
  const router = useRouter();
  const [region, setRegion] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (difficulty) params.set("difficulty", difficulty);
    if (duration) params.set("max_duration", duration);
    router.push(`${localePath(locale, "/trails")}${params.size ? `?${params}` : ""}`);
  }

  const field = "w-full rounded-full px-5 py-2 text-sm font-semibold text-ink-900 transition hover:bg-sand-200/60 sm:border-r sm:border-sand-200 sm:rounded-none sm:first:rounded-l-full";

  return (
    <form onSubmit={submit} className="grid w-full max-w-3xl grid-cols-1 gap-1 rounded-3xl bg-sand-50 p-2 shadow-[var(--shadow-lift)] sm:grid-cols-[1fr_1fr_1fr_auto] sm:rounded-full">
      <Dropdown
        eyebrow
        label={h.searchWhere}
        value={region}
        onChange={setRegion}
        className={cn(field, "sm:rounded-l-full")}
        options={[{ value: "", label: h.searchAnywhere }, ...regions.filter((r) => r.hiking_advised).map((r) => ({ value: r.slug, label: r.name }))]}
      />
      <Dropdown
        eyebrow
        label={h.searchDifficulty}
        value={difficulty}
        onChange={setDifficulty}
        className={field}
        options={[{ value: "", label: h.searchAnyLevel }, ...DIFFICULTIES.map((d) => ({ value: d, label: dict.difficulty[d], dot: DIFFICULTY_STYLE[d].color }))]}
      />
      <Dropdown
        eyebrow
        label={h.searchDuration}
        value={duration}
        onChange={setDuration}
        className={cn(field, "sm:border-r-0")}
        options={[{ value: "", label: h.searchAnyLength }, ...DURATIONS.map((d) => ({ value: d, label: dict.duration[d] }))]}
      />
      <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-forest-800 px-6 py-3.5 font-bold text-sand-50 transition hover:bg-forest-900 sm:aspect-square sm:px-0">
        <Search className="size-5" strokeWidth={2.5} />
        <span className="sm:sr-only">{h.searchSubmit}</span>
      </button>
    </form>
  );
}
