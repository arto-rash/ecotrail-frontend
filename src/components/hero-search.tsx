"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { DIFFICULTY, DURATION_FILTERS } from "@/lib/format";
import type { Region } from "@/lib/types";

export function HeroSearch({ regions }: { regions: Region[] }) {
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
    router.push(`/trails${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="grid w-full max-w-3xl grid-cols-1 gap-1 rounded-3xl bg-sand-50 p-2 shadow-[var(--shadow-lift)] sm:grid-cols-[1fr_1fr_1fr_auto] sm:rounded-full"
    >
      <Field label="Where" value={region} onChange={setRegion}>
        <option value="">Anywhere in Azerbaijan</option>
        {regions.map((r) => (
          <option key={r.slug} value={r.slug}>{r.name}</option>
        ))}
      </Field>
      <Field label="Difficulty" value={difficulty} onChange={setDifficulty}>
        <option value="">Any level</option>
        {Object.entries(DIFFICULTY).map(([value, d]) => (
          <option key={value} value={value}>{d.label}</option>
        ))}
      </Field>
      <Field label="Duration" value={duration} onChange={setDuration}>
        <option value="">Any length</option>
        {DURATION_FILTERS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </Field>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bg-forest-800 px-6 py-3.5 font-bold text-sand-50 transition hover:bg-forest-900 sm:aspect-square sm:px-0"
      >
        <Search className="size-5" strokeWidth={2.5} />
        <span className="sm:sr-only">Find trails</span>
      </button>
    </form>
  );
}

function Field({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="flex flex-col rounded-full px-5 py-2 text-left transition hover:bg-sand-200/60 sm:border-r sm:border-sand-200 sm:last-of-type:border-0">
      <span className="text-[0.65rem] font-bold tracking-[0.16em] text-ink-500 uppercase">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="-ml-1 cursor-pointer appearance-none truncate bg-transparent text-sm font-semibold text-ink-900 outline-none"
      >
        {children}
      </select>
    </label>
  );
}
