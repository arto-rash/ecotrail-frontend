"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RegionMap } from "./region-map";
import type { Region } from "@/lib/types";

/** Region map that sets ?region= on the current page (or navigates to `target`). */
export function RegionPicker({ regions, target, compact, className }: { regions: Region[]; target?: string; compact?: boolean; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = target ? null : params.get("region");

  return (
    <RegionMap
      regions={regions}
      active={active}
      compact={compact}
      className={className}
      onSelect={(slug) => {
        const next = new URLSearchParams(target ? "" : params.toString());
        if (slug) next.set("region", slug);
        else next.delete("region");
        const base = target ?? pathname;
        const url = `${base}${next.size ? `?${next}` : ""}`;
        if (target) router.push(url);
        else router.replace(url, { scroll: false });
      }}
    />
  );
}
