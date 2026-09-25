"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { Select } from "./select";
import { localePath } from "@/i18n/config";
import { DIFFICULTIES, DURATIONS } from "@/lib/format";
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

  const field = "-ml-1 truncate bg-transparent text-sm font-semibold text-ink-900 outline-none";

  return (
    <form onSubmit={submit} className="grid w-full max-w-3xl grid-cols-1 gap-1 rounded-3xl bg-sand-50 p-2 shadow-[var(--shadow-lift)] sm:grid-cols-[1fr_1fr_1fr_auto] sm:rounded-full">
      <Field label={h.searchWhere}>
        <Select value={region} onChange={(e) => setRegion(e.target.value)} className={field}>
          <option value="">{h.searchAnywhere}</option>
          {regions.filter((r) => r.hiking_advised).map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
        </Select>
      </Field>
      <Field label={h.searchDifficulty}>
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={field}>
          <option value="">{h.searchAnyLevel}</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{dict.difficulty[d]}</option>)}
        </Select>
      </Field>
      <Field label={h.searchDuration}>
        <Select value={duration} onChange={(e) => setDuration(e.target.value)} className={field}>
          <option value="">{h.searchAnyLength}</option>
          {DURATIONS.map((d) => <option key={d} value={d}>{dict.duration[d]}</option>)}
        </Select>
      </Field>
      <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-forest-800 px-6 py-3.5 font-bold text-sand-50 transition hover:bg-forest-900 sm:aspect-square sm:px-0">
        <Search className="size-5" strokeWidth={2.5} />
        <span className="sm:sr-only">{h.searchSubmit}</span>
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col rounded-full px-5 py-2 text-left transition hover:bg-sand-200/60 sm:border-r sm:border-sand-200 sm:last-of-type:border-0">
      <span className="text-[0.65rem] font-bold tracking-[0.16em] text-ink-500 uppercase">{label}</span>
      {children}
    </label>
  );
}
