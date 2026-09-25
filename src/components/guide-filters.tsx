"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { Dropdown } from "./dropdown";
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

  const chip = (on: boolean) => cn("h-10 rounded-full px-4 text-sm font-bold ring-1", on ? "bg-forest-800 text-sand-50 ring-forest-800" : "bg-white text-ink-700 ring-sand-200");

  return (
    <div className={cn("flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-60")}>
      <Dropdown
        label={dict.guides.worksIn}
        value={params.get("region") ?? ""}
        onChange={(v) => set("region", v)}
        options={[{ value: "", label: dict.explore.allRegions }, ...regions.filter((r) => r.hiking_advised).map((r) => ({ value: r.slug, label: r.name }))]}
        className={chip(!!params.get("region"))}
      />
      <Dropdown
        label={dict.guides.languagesLabel}
        value={params.get("language") ?? ""}
        onChange={(v) => set("language", v)}
        options={[{ value: "", label: dict.guides.anyLanguage }, ...languages.map((l) => ({ value: l.value, label: l.label }))]}
        className={chip(!!params.get("language"))}
      />
      <Dropdown
        label={dict.guides.kind}
        value={params.get("kind") ?? ""}
        onChange={(v) => set("kind", v)}
        options={[{ value: "", label: dict.guides.allKinds }, { value: "guide", label: dict.guides.guide }, { value: "agency", label: dict.guides.agency }]}
        className={chip(!!params.get("kind"))}
      />
      {active && (
        <button type="button" onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))} className="inline-flex items-center gap-1 px-2 text-sm font-bold text-pomegranate-600">
          <X className="size-3.5" /> {dict.common.clearFilters}
        </button>
      )}
    </div>
  );
}
