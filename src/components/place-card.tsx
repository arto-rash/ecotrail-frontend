"use client";

import Link from "next/link";
import { MountainSnow } from "lucide-react";
import { CoverImage } from "./cover-image";
import { useI18n } from "./i18n-provider";
import { LocationLink } from "./location-link";
import { Rating } from "./rating";
import { localePath } from "@/i18n/config";
import { formatMetres } from "@/lib/format";
import type { Place } from "@/lib/types";

export function PlaceCard({ place, priority, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 85vw" }: { place: Place; priority?: boolean; sizes?: string }) {
  const { locale, dict } = useI18n();
  const where = [place.district?.name, place.region?.name].filter(Boolean).join(", ");

  return (
    <Link href={localePath(locale, `/places/${place.slug}`)} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-forest-900 shadow-[var(--shadow-card)]">
        <CoverImage image={place.image} kind={place.type} alt={place.name} sizes={sizes} priority={priority} className="transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-forest-800 backdrop-blur">
          {dict.placeType[place.type]}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4 text-sand-50">
          <h3 className="font-display-tight text-xl leading-tight font-semibold">{place.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-sand-200/90">
            <LocationLink label={where} lat={place.location.lat} lng={place.location.lng} nested className="max-w-full" />
            {place.ele_m !== null && (
              <span className="inline-flex items-center gap-1">
                <MountainSnow className="size-3.5" />
                {place.ele_source === "srtm" ? "≈ " : ""}
                {formatMetres(place.ele_m, locale, dict)}
              </span>
            )}
            <Rating value={place.rating} className="ml-auto text-xs" />
          </div>
        </div>
      </div>
    </Link>
  );
}
