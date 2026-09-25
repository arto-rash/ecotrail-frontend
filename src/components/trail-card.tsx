import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Mountain, Route } from "lucide-react";
import { DifficultyBadge } from "./difficulty-badge";
import { Rating } from "./rating";
import { imageUrl } from "@/lib/api";
import { cn, formatDistance, formatDuration } from "@/lib/format";
import type { Trail } from "@/lib/types";

type Props = {
  trail: Trail;
  variant?: "tile" | "row";
  priority?: boolean;
  active?: boolean;
  onHover?: (slug: string | null) => void;
};

export function TrailCard({ trail, variant = "tile", priority, active, onHover }: Props) {
  const src = imageUrl(trail.cover_image);
  const place = [trail.village, trail.region?.name].filter(Boolean).join(", ");

  if (variant === "row") {
    return (
      <Link
        href={`/trails/${trail.slug}`}
        onMouseEnter={() => onHover?.(trail.slug)}
        onMouseLeave={() => onHover?.(null)}
        className={cn(
          "group flex gap-4 rounded-[var(--radius-card)] bg-white p-3 shadow-[var(--shadow-card)] ring-1 transition",
          active ? "ring-forest-600" : "ring-sand-200 hover:ring-sand-300",
        )}
      >
        <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-sand-200 sm:w-44">
          {src && <Image src={src} alt="" fill priority={priority} sizes="176px" className="object-cover transition duration-500 group-hover:scale-105" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display-tight text-lg leading-tight font-semibold text-ink-900 sm:text-xl">{trail.name}</h3>
            <Rating value={trail.rating} className="shrink-0 text-ink-700" />
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-ink-500">
            <MapPin className="size-3.5" />
            {place}
          </p>
          <p className="mt-2 line-clamp-2 hidden text-sm text-ink-700 sm:block">{trail.summary}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-xs font-semibold text-ink-700">
            <DifficultyBadge difficulty={trail.difficulty} />
            <span className="inline-flex items-center gap-1"><Route className="size-3.5" />{formatDistance(trail.distance_km)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{formatDuration(trail.duration_minutes)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/trails/${trail.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand-200 shadow-[var(--shadow-card)]">
        {src && (
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 80vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <DifficultyBadge difficulty={trail.difficulty} className="bg-white/90 backdrop-blur" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-sand-50">
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-sand-200/90">
            <MapPin className="size-3.5" />
            {place}
          </p>
          <h3 className="font-display-tight text-2xl leading-tight font-semibold">{trail.name}</h3>
          <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-sand-100">
            <span className="inline-flex items-center gap-1"><Route className="size-3.5" />{formatDistance(trail.distance_km)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{formatDuration(trail.duration_minutes)}</span>
            {trail.elevation_gain_m ? (
              <span className="inline-flex items-center gap-1"><Mountain className="size-3.5" />+{trail.elevation_gain_m} m</span>
            ) : null}
            <Rating value={trail.rating} className="ml-auto text-xs" />
          </div>
        </div>
      </div>
    </Link>
  );
}
