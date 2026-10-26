"use client";

import { useEffect, useRef, useState } from "react";
import type { ExpressionSpecification, GeoJSONSource, Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import { useI18n } from "./i18n-provider";
import { localePath } from "@/i18n/config";
import { DIFFICULTY_STYLE, cn, formatDistance, formatDuration, formatMetres } from "@/lib/format";
import { googleMapsUrl } from "@/lib/maps";
import type { MapData, PlaceFeatureProps, TrailFeatureProps } from "@/lib/types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
export const AZ_BOUNDS: [number, number, number, number] = [44.77, 38.39, 50.63, 41.91];

export const PLACE_COLORS: Record<PlaceFeatureProps["type"], string> = {
  waterfall: "#2f7fb0",
  lake: "#1f9aa8",
  peak: "#6b5646",
  village: "#c9912a",
  historic: "#b4432a",
  park: "#356a47",
};

export type Bbox = [number, number, number, number];

type Props = {
  data?: Partial<MapData>;
  show?: { trails: boolean; places: boolean };
  activeSlug?: string | null;
  onActiveChange?: (slug: string | null) => void;
  onBoundsChange?: (bbox: Bbox) => void;
  /** Fit the view to these bounds whenever they change; defaults to the data's extent. */
  fit?: Bbox | null;
  /** Click-to-place mode for picking a coordinate. */
  pick?: { value: { lat: number; lng: number } | null; onChange: (v: { lat: number; lng: number }) => void };
  interactive?: boolean;
  className?: string;
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function extent(data?: Partial<MapData>): Bbox | null {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  const add = ([x, y]: [number, number]) => {
    w = Math.min(w, x); s = Math.min(s, y); e = Math.max(e, x); n = Math.max(n, y);
  };
  data?.trails?.features.forEach((f) => f.geometry.coordinates.forEach((line) => line.forEach(add)));
  data?.places?.features.forEach((f) => add(f.geometry.coordinates));
  return Number.isFinite(w) ? [w, s, e, n] : null;
}

const EMPTY = { type: "FeatureCollection" as const, features: [] };

export function TrailMap({ data, show = { trails: true, places: true }, activeSlug, onActiveChange, onBoundsChange, fit, pick, interactive = true, className }: Props) {
  const { locale, dict } = useI18n();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const popup = useRef<Popup | null>(null);
  const pickMarker = useRef<Marker | null>(null);
  const activeRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const callbacks = useRef({ onActiveChange, onBoundsChange, pick, dict, locale });

  useEffect(() => {
    callbacks.current = { onActiveChange, onBoundsChange, pick, dict, locale };
  });

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
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
        interactive,
      });
      map.current = m;
      if (interactive) m.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      const collapseAttribution = () => container.current?.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
      m.once("idle", collapseAttribution);

      m.once("style.load", () => {
        collapseAttribution();
        m.addSource("et-trails", { type: "geojson", data: EMPTY, promoteId: "slug" });
        m.addSource("et-trailheads", { type: "geojson", data: EMPTY, promoteId: "slug" });
        m.addSource("et-places", { type: "geojson", data: EMPTY, promoteId: "slug" });

        const difficultyColor = ["match", ["get", "difficulty"], ...Object.entries(DIFFICULTY_STYLE).flatMap(([k, v]) => [k, v.color]), "#356a47"] as unknown as ExpressionSpecification;
        const isActive: ExpressionSpecification = ["boolean", ["feature-state", "active"], false];

        m.addLayer({ id: "et-trail-casing", type: "line", source: "et-trails", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": ["case", isActive, 9, 6], "line-opacity": 0.9 } });
        m.addLayer({ id: "et-trail-line", type: "line", source: "et-trails", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": difficultyColor, "line-width": ["case", isActive, 5.5, 3.5] } });
        m.addLayer({ id: "et-trailheads", type: "circle", source: "et-trailheads", paint: { "circle-radius": ["case", isActive, 8, 5.5], "circle-color": difficultyColor, "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 } });
        m.addLayer({
          id: "et-places",
          type: "circle",
          source: "et-places",
          paint: {
            // "zoom" may only drive a top-level interpolate, so the active case goes inside it.
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, ["case", isActive, 8, 4.5], 11, ["case", isActive, 10, 7]],
            "circle-color": ["match", ["get", "type"], ...Object.entries(PLACE_COLORS).flat(), "#356a47"] as never,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });
        m.addLayer({
          id: "et-place-labels",
          type: "symbol",
          source: "et-places",
          minzoom: 9,
          layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 12, "text-offset": [0, 1.1], "text-anchor": "top", "text-optional": true },
          paint: { "text-color": "#1a1d19", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
        });

        for (const layer of ["et-trail-line", "et-trailheads", "et-places"]) {
          m.on("mouseenter", layer, (e) => {
            m.getCanvas().style.cursor = "pointer";
            const slug = e.features?.[0]?.properties?.slug as string | undefined;
            if (slug) callbacks.current.onActiveChange?.(slug);
          });
          m.on("mouseleave", layer, () => {
            m.getCanvas().style.cursor = callbacks.current.pick ? "crosshair" : "";
            callbacks.current.onActiveChange?.(null);
          });
          m.on("click", layer, (e) => {
            const f = e.features?.[0];
            if (!f) return;
            e.preventDefault();
            showFeaturePopup(f.properties as TrailFeatureProps | PlaceFeatureProps, e.lngLat);
          });
        }

        setReady(true);
      });

      const showFeaturePopup = (p: TrailFeatureProps | PlaceFeatureProps, at: { lng: number; lat: number }) => {
        const { dict: d, locale: l } = callbacks.current;
        const isTrail = p.kind === "trail";
        const href = localePath(l, `/${isTrail ? "trails" : "places"}/${p.slug}`);
        const [lat, lng] = isTrail ? [p.lat, p.lng] : [at.lat, at.lng];
        const meta = isTrail
          ? [formatDistance(p.distance_km, l, d), formatDuration(p.duration_minutes, d), d.difficulty[p.difficulty]]
          : [d.placeType[p.type], p.ele_m !== null ? formatMetres(p.ele_m, l, d) : null];
        popup.current?.remove();
        popup.current = new maplibre.Popup({ offset: 12, maxWidth: "260px" })
          .setLngLat(at)
          .setHTML(
            `<div style="width:240px">
              <a href="${escapeHtml(href)}" style="display:block;color:inherit;text-decoration:none">
                ${p.image ? `<img src="${escapeHtml(p.image)}" alt="" style="width:100%;height:120px;object-fit:cover;display:block" />` : ""}
                <div style="padding:10px 12px 4px">
                  <div style="font-family:var(--font-display);font-size:17px;font-weight:800;letter-spacing:-0.03em;font-variation-settings:'SHRP' 100;line-height:1.2">${escapeHtml(p.name)}</div>
                  <div style="margin-top:4px;font-size:12px;color:#676e63;font-weight:600">${meta.filter(Boolean).map((s) => escapeHtml(String(s))).join(" · ")}</div>
                </div>
              </a>
              <a href="${googleMapsUrl(lat, lng)}" target="_blank" rel="noopener noreferrer" style="display:block;padding:4px 12px 12px;font-size:12px;font-weight:700;color:#285237">${escapeHtml(d.common.openInGoogleMaps)} ↗</a>
            </div>`,
          )
          .addTo(m);
      };

      const showPointPopup = (at: { lng: number; lat: number }) => {
        const { dict: d } = callbacks.current;
        const lat = +at.lat.toFixed(5);
        const lng = +at.lng.toFixed(5);
        popup.current?.remove();
        popup.current = new maplibre.Popup({ offset: 6, maxWidth: "240px" })
          .setLngLat(at)
          .setHTML(
            `<div style="padding:10px 12px;font-size:12px">
              <div style="font-weight:700;color:#1a1d19">${escapeHtml(d.map.thisPoint)}</div>
              <div style="font-family:ui-monospace,monospace;color:#676e63;margin:2px 0 6px">${lat}, ${lng}</div>
              <a href="${googleMapsUrl(lat, lng)}" target="_blank" rel="noopener noreferrer" style="font-weight:700;color:#285237">${escapeHtml(d.common.openInGoogleMaps)} ↗</a>
            </div>`,
          )
          .addTo(m);
      };

      // Right-click, or long-press on touch screens, opens any point in Google Maps.
      m.on("contextmenu", (e) => {
        if (!callbacks.current.pick) showPointPopup(e.lngLat);
      });
      let pressTimer: ReturnType<typeof setTimeout> | undefined;
      m.on("touchstart", (e) => {
        if (e.originalEvent.touches.length !== 1) return;
        pressTimer = setTimeout(() => !callbacks.current.pick && showPointPopup(e.lngLat), 600);
      });
      for (const ev of ["touchend", "touchmove", "touchcancel", "dragstart"] as const) m.on(ev, () => clearTimeout(pressTimer));

      m.on("click", (e) => {
        const p = callbacks.current.pick;
        if (p) p.onChange({ lat: +e.lngLat.lat.toFixed(6), lng: +e.lngLat.lng.toFixed(6) });
      });
      m.on("moveend", () => {
        const b = m.getBounds();
        callbacks.current.onBoundsChange?.([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      });
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [interactive]);

  // Push data into the sources.
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const trails = data?.trails ?? EMPTY;
    (m.getSource("et-trails") as GeoJSONSource).setData(trails as never);
    (m.getSource("et-trailheads") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: (data?.trails?.features ?? []).map((f) => ({ type: "Feature", geometry: { type: "Point", coordinates: [f.properties.lng, f.properties.lat] }, properties: f.properties })),
    } as never);
    (m.getSource("et-places") as GeoJSONSource).setData((data?.places ?? EMPTY) as never);
  }, [data, ready]);

  // Fit to explicit bounds, else to the data.
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const target = fit ?? extent(data);
    if (!target) return;
    const [w, s, e, n] = target;
    if (w === e && s === n) m.jumpTo({ center: [w, s], zoom: 11 });
    else m.fitBounds([[w, s], [e, n]], { padding: 40, maxZoom: 12.5, duration: 600 });
  }, [fit, data, ready]);

  // Layer visibility.
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    for (const id of ["et-trail-casing", "et-trail-line", "et-trailheads"]) m.setLayoutProperty(id, "visibility", show.trails ? "visible" : "none");
    for (const id of ["et-places", "et-place-labels"]) m.setLayoutProperty(id, "visibility", show.places ? "visible" : "none");
  }, [show.trails, show.places, ready]);

  // Highlight the active feature.
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const prev = activeRef.current;
    for (const source of ["et-trails", "et-trailheads", "et-places"]) {
      if (prev) m.setFeatureState({ source, id: prev }, { active: false });
      if (activeSlug) m.setFeatureState({ source, id: activeSlug }, { active: true });
    }
    activeRef.current = activeSlug ?? null;
  }, [activeSlug, ready, data]);

  // Picker marker.
  const pickValue = pick?.value;
  useEffect(() => {
    const m = map.current;
    const maplibre = lib.current;
    if (!ready || !m || !maplibre) return;
    m.getCanvas().style.cursor = pick ? "crosshair" : "";
    if (!pickValue) {
      pickMarker.current?.remove();
      pickMarker.current = null;
      return;
    }
    if (!pickMarker.current) {
      pickMarker.current = new maplibre.Marker({ color: "#b4432a", draggable: true }).setLngLat([pickValue.lng, pickValue.lat]).addTo(m);
      pickMarker.current.on("dragend", () => {
        const ll = pickMarker.current!.getLngLat();
        callbacks.current.pick?.onChange({ lat: +ll.lat.toFixed(6), lng: +ll.lng.toFixed(6) });
      });
    } else {
      pickMarker.current.setLngLat([pickValue.lng, pickValue.lat]);
    }
  }, [pickValue, ready, pick]);

  return (
    <div className={cn("relative overflow-hidden bg-moss-100", className)}>
      {/* Inline position: maplibre's unlayered CSS sets .maplibregl-map to relative, which beats Tailwind utilities. */}
      <div ref={container} style={{ position: "absolute", inset: 0 }} />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-forest-700/70">
          <span className="animate-pulse">{dict.common.loadingMap}</span>
        </div>
      )}
    </div>
  );
}
