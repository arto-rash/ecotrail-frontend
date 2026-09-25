"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { Select } from "./select";
import { cn } from "@/lib/format";
import type { Option, Region } from "@/lib/types";

export function GuideFilters({ regions, languages }: { regions: Region[]; languages: Option[] }) {
  const { dict } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const active = ["region", "language", "kind"].some((k) => params.get(k));

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  const chip = (on: boolean) => cn("h-10 rounded-full pl-4 text-sm font-bold ring-1 outline-none", on ? "bg-forest-800 text-sand-50 ring-forest-800" : "bg-white text-ink-700 ring-sand-200");

  return (
    <div className={cn("flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-60")}>
      <Select value={params.get("region") ?? ""} onChange={(e) => set("region", e.target.value)} aria-label={dict.guides.worksIn} className={chip(!!params.get("region"))}>
        <option value="">{dict.explore.allRegions}</option>
        {regions.filter((r) => r.hiking_advised).map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
      </Select>
      <Select value={params.get("language") ?? ""} onChange={(e) => set("language", e.target.value)} aria-label={dict.guides.languagesLabel} className={chip(!!params.get("language"))}>
        <option value="">{dict.guides.anyLanguage}</option>
        {languages.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
      </Select>
      <Select value={params.get("kind") ?? ""} onChange={(e) => set("kind", e.target.value)} aria-label={dict.guides.kind} className={chip(!!params.get("kind"))}>
        <option value="">{dict.guides.allKinds}</option>
        <option value="guide">{dict.guides.guide}</option>
        <option value="agency">{dict.guides.agency}</option>
      </Select>
      {active && (
        <button type="button" onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))} className="inline-flex items-center gap-1 px-2 text-sm font-bold text-pomegranate-600">
          <X className="size-3.5" /> {dict.common.clearFilters}
        </button>
      )}
    </div>
  );
}
