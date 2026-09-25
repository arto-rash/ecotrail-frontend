"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { DIFFICULTY, cn, formatDistance } from "@/lib/format";
import { imageUrl } from "@/lib/api";
import type { MapTrail } from "@/lib/types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const AZ_BOUNDS: [[number, number], [number, number]] = [[44.77, 38.39], [50.63, 41.91]];

type Props = {
  trails: MapTrail[];
  activeSlug?: string | null;
  onActiveChange?: (slug: string | null) => void;
  /** Show only dots, no name labels. */
  compact?: boolean;
  /** Zoom level when showing a single trail. */
  focusZoom?: number;
  /** Enables click-to-place mode for choosing a coordinate. */
  pick?: { value: { lat: number; lng: number } | null; onChange: (v: { lat: number; lng: number }) => void };
  interactive?: boolean;
  className?: string;
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function TrailMap({ trails, activeSlug, onActiveChange, compact, focusZoom = 11, pick, interactive = true, className }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const pickMarker = useRef<Marker | null>(null);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const [ready, setReady] = useState(false);
  const onActiveRef = useRef(onActiveChange);
  const pickRef = useRef(pick);

  useEffect(() => {
    onActiveRef.current = onActiveChange;
    pickRef.current = pick;
  });

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    const markerSet = markers.current;
    (async () => {
      const maplibre = await import("maplibre-gl");
      // The worker is served from /public (see the copy:maplibre script); bundlers don't emit it.
      maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      if (cancelled || !container.current) return;
      lib.current = maplibre;
      const m = new maplibre.Map({
        container: container.current,
        style: STYLE_URL,
        bounds: AZ_BOUNDS,
        fitBoundsOptions: { padding: 24 },
        attributionControl: { compact: true },
        cooperativeGestures: false,
        interactive,
      });
      if (interactive) m.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
      m.on("click", (e) => {
        const p = pickRef.current;
        if (p) p.onChange({ lat: +e.lngLat.lat.toFixed(6), lng: +e.lngLat.lng.toFixed(6) });
      });
      // Name labels collide when zoomed out; show dots only until the user zooms in.
      const syncLabels = () => container.current?.classList.toggle("labels-hidden", m.getZoom() < 8.5);
      m.on("zoomend", syncLabels);
      // Compact attribution starts expanded; collapse it so it doesn't cover small maps.
      const collapseAttribution = () =>
        container.current?.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
      m.once("idle", collapseAttribution);
      m.once("style.load", () => {
        syncLabels();
        collapseAttribution();
        setReady(true);
      });
      map.current = m;
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markerSet.clear();
    };
  }, [interactive]);

  // Sync trail markers.
  useEffect(() => {
    const m = map.current;
    const maplibre = lib.current;
    if (!ready || !m || !maplibre) return;

    markers.current.forEach((mk) => mk.remove());
    markers.current.clear();

    for (const t of trails) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = cn("trail-marker", compact && "is-compact");
      el.setAttribute("aria-label", t.name);
      el.innerHTML = `<span class="dot" style="background:${DIFFICULTY[t.difficulty].color}"></span><span class="label">${escapeHtml(t.name)}</span>`;
      el.addEventListener("mouseenter", () => onActiveRef.current?.(t.slug));
      el.addEventListener("mouseleave", () => onActiveRef.current?.(null));

      const img = imageUrl(t.cover_image);
      const popup = new maplibre.Popup({ offset: 18, maxWidth: "260px" }).setHTML(
        `<a href="/trails/${encodeURIComponent(t.slug)}" style="display:block;width:240px;color:inherit;text-decoration:none">
          ${img ? `<img src="${escapeHtml(img)}" alt="" style="width:100%;height:120px;object-fit:cover;display:block" />` : ""}
          <div style="padding:10px 12px 12px">
            <div style="font-family:var(--font-display);font-size:17px;font-weight:600;line-height:1.2">${escapeHtml(t.name)}</div>
            <div style="margin-top:4px;font-size:12px;color:#676e63;font-weight:600">
              ${[t.region, t.distance_km ? formatDistance(t.distance_km) : null, DIFFICULTY[t.difficulty].label].filter(Boolean).map((s) => escapeHtml(String(s))).join(" · ")}
            </div>
          </div>
        </a>`,
      );

      const marker = new maplibre.Marker({ element: el, anchor: "left", offset: [-8, 0] })
        .setLngLat([t.location.lng, t.location.lat])
        .setPopup(popup)
        .addTo(m);
      markers.current.set(t.slug, marker);
    }

    if (trails.length === 1) {
      m.jumpTo({ center: [trails[0].location.lng, trails[0].location.lat], zoom: focusZoom });
    } else if (trails.length > 1) {
      const b = new maplibre.LngLatBounds();
      trails.forEach((t) => b.extend([t.location.lng, t.location.lat]));
      m.fitBounds(b, { padding: { top: 60, bottom: 60, left: 40, right: 160 }, maxZoom: 10, duration: 600 });
    }
  }, [trails, ready, compact, focusZoom]);

  // Highlight the active marker.
  useEffect(() => {
    markers.current.forEach((mk, slug) => {
      mk.getElement().classList.toggle("is-active", slug === activeSlug);
    });
  }, [activeSlug, trails, ready]);

  // Picker marker.
  const pickValue = pick?.value;
  useEffect(() => {
    const m = map.current;
    const maplibre = lib.current;
    if (!ready || !m || !maplibre) return;
    if (!pickValue) {
      pickMarker.current?.remove();
      pickMarker.current = null;
      return;
    }
    if (!pickMarker.current) {
      pickMarker.current = new maplibre.Marker({ color: "#b4432a", draggable: true })
        .setLngLat([pickValue.lng, pickValue.lat])
        .addTo(m);
      pickMarker.current.on("dragend", () => {
        const ll = pickMarker.current!.getLngLat();
        pickRef.current?.onChange({ lat: +ll.lat.toFixed(6), lng: +ll.lng.toFixed(6) });
      });
    } else {
      pickMarker.current.setLngLat([pickValue.lng, pickValue.lat]);
    }
  }, [pickValue, ready]);

  return (
    <div className={cn("relative overflow-hidden bg-moss-100", className)}>
      {/* Inline position: maplibre's unlayered CSS sets .maplibregl-map to relative, which beats Tailwind utilities. */}
      <div ref={container} style={{ position: "absolute", inset: 0 }} className={cn(pick && "[&_canvas]:cursor-crosshair")} />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-forest-700/70">
          <span className="animate-pulse">Loading map…</span>
        </div>
      )}
    </div>
  );
}
