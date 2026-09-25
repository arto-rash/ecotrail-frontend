"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { googleMapsUrl } from "@/lib/maps";
import { cn } from "@/lib/format";

/**
 * "Village, district" with a pin, opening the spot in Google Maps in a new tab.
 * Renders a button when nested inside a card link, since anchors can't nest.
 */
export function LocationLink({
  label,
  lat,
  lng,
  nested = false,
  className,
}: {
  label: string;
  lat: number;
  lng: number;
  nested?: boolean;
  className?: string;
}) {
  const { dict } = useI18n();
  const url = googleMapsUrl(lat, lng);
  const classes = cn(
    "inline-flex items-center gap-1 rounded-sm underline-offset-2 transition-colors hover:underline focus-visible:outline-2",
    className,
  );
  const content = (
    <>
      <MapPin className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </>
  );

  if (nested) {
    return (
      <button
        type="button"
        title={dict.common.openInGoogleMaps}
        className={cn(classes, "cursor-pointer text-left")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(url, "_blank", "noopener,noreferrer");
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={dict.common.openInGoogleMaps} className={classes}>
      {content}
    </a>
  );
}
