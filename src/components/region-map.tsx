"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useI18n } from "./i18n-provider";
import regionShapes from "@/data/az-regions.json";
import { fill } from "@/i18n/config";
import { cn } from "@/lib/format";
import type { Region } from "@/lib/types";

type Shape = { name: { az: string; en: string }; path: string; label: [number, number]; bounds: [number, number, number, number] };

export const REGION_SHAPES = regionShapes.regions as unknown as Record<string, Shape>;

// Soft fills from the palette, assigned so that neighbours differ.
const FILLS: Record<string, string> = {
  nakhchivan: "#e5eddc",
  "gazakh-tovuz": "#f6ead0",
  "ganja-dashkasan": "#f7e1d8",
  "shaki-zagatala": "#e7e1ec",
  "guba-khachmaz": "#f6ead0",
  "central-aran": "#e5eddc",
  "mountainous-shirvan": "#f0e9da",
  "absheron-khizi": "#f7e1d8",
  baku: "#e5eddc",
  karabakh: "#e7e1ec",
  "east-zangezur": "#e5eddc",
  "mil-mughan": "#f6ead0",
  "shirvan-salyan": "#e7e1ec",
  "lankaran-astara": "#f0e9da",
};

export function RegionMap({
  regions,
  active,
  onSelect,
  compact = false,
  className,
}: {
  regions: Region[];
  active?: string | null;
  onSelect: (slug: string | null) => void;
  compact?: boolean;
  className?: string;
}) {
  const { locale, dict } = useI18n();
  const [hover, setHover] = useState<string | null>(null);
  const bySlug = Object.fromEntries(regions.map((r) => [r.slug, r]));
  const focus = hover ?? active ?? null;
  const focused = focus ? bySlug[focus] : null;

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${regionShapes.width} ${regionShapes.height}`} className="h-auto w-full" role="group" aria-label={dict.explore.pickRegion}>
        <defs>
          <pattern id="no-hiking" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#ebe2d0" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#c4b393" strokeWidth="3" />
          </pattern>
        </defs>
        {Object.entries(REGION_SHAPES).map(([slug, shape]) => {
          const info = bySlug[slug];
          const advised = info?.hiking_advised ?? true;
          const isActive = active === slug;
          const isHover = hover === slug;
          return (
            <path
              key={slug}
              d={shape.path}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={shape.name[locale]}
              fill={isActive ? "#285237" : advised ? FILLS[slug] : "url(#no-hiking)"}
              stroke="#fbf8f2"
              strokeWidth={isActive || isHover ? 2.5 : 1.5}
              className={cn(
                "cursor-pointer transition-[filter,fill] duration-150 outline-none focus-visible:brightness-90",
                !isActive && "hover:brightness-[0.93]",
              )}
              onMouseEnter={() => setHover(slug)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(slug)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect(isActive ? null : slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(isActive ? null : slug);
                }
              }}
            />
          );
        })}
      </svg>

      {/* Name pills, positioned in % so they scale with the SVG. */}
      {Object.entries(REGION_SHAPES).map(([slug, shape]) => {
        const isActive = active === slug;
        if (compact && !isActive && hover !== slug) return null;
        return (
          <span
            key={slug}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-center text-[0.62rem] leading-tight font-bold whitespace-nowrap shadow-sm transition sm:text-xs",
              isActive ? "bg-forest-950 text-sand-50" : "bg-plum-700/85 text-sand-50",
              // Too crowded to label every region on a phone; show only the active or hovered one.
              !isActive && hover !== slug && "max-sm:hidden",
              hover === slug && !isActive && "scale-110",
            )}
            style={{ left: `${(shape.label[0] / regionShapes.width) * 100}%`, top: `${(shape.label[1] / regionShapes.height) * 100}%` }}
          >
            {shape.name[locale]}
          </span>
        );
      })}

      {/* Details for the hovered or active region. */}
      <div className="pointer-events-none absolute right-0 bottom-0 min-h-14 max-w-[70%] rounded-2xl bg-white/95 px-4 py-2.5 text-sm shadow-[var(--shadow-card)] ring-1 ring-sand-200">
        {focused ? (
          <>
            <p className="font-display-tight text-base font-semibold text-forest-900">{focused.name}</p>
            {focused.hiking_advised ? (
              <p className="text-xs font-semibold text-ink-500">
                {fill(dict.regionMap.trails, { count: focused.trails_count ?? 0 })} · {fill(dict.regionMap.places, { count: focused.places_count ?? 0 })}
              </p>
            ) : (
              <p className="flex items-center gap-1 text-xs font-bold text-pomegranate-700">
                <TriangleAlert className="size-3.5" /> {dict.regionMap.noHiking}
              </p>
            )}
          </>
        ) : (
          <p className="pt-1.5 text-xs font-semibold text-ink-500">{dict.map.regionHint}</p>
        )}
      </div>
    </div>
  );
}
