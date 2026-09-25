"use client";

import Link from "next/link";
import { Clock, Mountain, Route } from "lucide-react";
import { CoverImage } from "./cover-image";
import { DifficultyBadge } from "./difficulty-badge";
import { useI18n } from "./i18n-provider";
import { LocationLink } from "./location-link";
import { Rating } from "./rating";
import { localePath } from "@/i18n/config";
import { formatDistance, formatDuration, formatMetres } from "@/lib/format";
import type { Trail } from "@/lib/types";

export function trailPlace(trail: Trail): string {
  return [trail.village, trail.district?.name, trail.region?.name].filter(Boolean).slice(0, 2).join(", ");
}

export function TrailCard({ trail, priority, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw" }: { trail: Trail; priority?: boolean; sizes?: string }) {
  const { locale, dict } = useI18n();
  const est = trail.stats_estimated ? ` ${dict.common.est}` : "";

  return (
    <Link href={localePath(locale, `/trails/${trail.slug}`)} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-forest-900 shadow-[var(--shadow-card)]">
        <CoverImage image={trail.image} kind="trail" alt={trail.name} sizes={sizes} priority={priority} className="transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/15 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <DifficultyBadge difficulty={trail.difficulty} className="bg-white/90 backdrop-blur" />
          {trail.duration_minutes > 600 && (
            <span className="rounded-full bg-forest-950/70 px-2.5 py-1 text-xs font-bold text-sand-50 backdrop-blur">{dict.trail.multiDay}</span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-sand-50">
          <LocationLink label={trailPlace(trail)} lat={trail.location.lat} lng={trail.location.lng} nested className="mb-1 max-w-full text-xs font-semibold text-sand-200/90" />
          <h3 className="font-display-tight text-2xl leading-tight font-semibold">{trail.name}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-sand-100">
            <span className="inline-flex items-center gap-1"><Route className="size-3.5" />{formatDistance(trail.distance_km, locale, dict)}</span>
            <span className="inline-flex items-center gap-1" title={trail.stats_estimated ? dict.common.estimatedTooltip : undefined}>
              <Clock className="size-3.5" />{formatDuration(trail.duration_minutes, dict)}{est}
            </span>
            {trail.ascent_m ? (
              <span className="inline-flex items-center gap-1"><Mountain className="size-3.5" />+{formatMetres(trail.ascent_m, locale, dict)}</span>
            ) : null}
            <Rating value={trail.rating} className="ml-auto text-xs" />
          </div>
        </div>
      </div>
    </Link>
  );
}
