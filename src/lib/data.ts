import "server-only";
import { api, ApiError } from "./api";
import { getLocale } from "@/i18n/dictionaries";
import type { Guide, GuideDetail, MapData, Options, Paginated, Place, PlaceDetail, Region, Stats, Trail, TrailDetail } from "./types";

const CACHE = { next: { revalidate: 300 } };

type Query = Record<string, string | string[] | number | boolean | undefined>;

/** Build "path?lang=az&a[]=1" from a query object; arrays use Laravel's key[] form. */
async function url(path: string, query: Query = {}): Promise<string> {
  const params = new URLSearchParams({ lang: await getLocale() });
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "" || value === false) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(`${key}[]`, v));
    else params.set(key, value === true ? "1" : String(value));
  }
  return `${path}?${params}`;
}

async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export type TrailQuery = {
  q?: string;
  region?: string;
  difficulty?: string[];
  feature?: string[];
  max_duration?: string;
  sort?: string;
  featured?: boolean;
  per_page?: number;
};

export type PlaceQuery = {
  q?: string;
  region?: string;
  type?: string[];
  sort?: string;
  featured?: boolean;
  per_page?: number;
};

export async function getTrails(query: TrailQuery = {}) {
  return api<Paginated<Trail>>(await url("trails", { per_page: 100, ...query }), CACHE);
}

export async function getTrail(slug: string) {
  return orNull(api<{ data: TrailDetail }>(await url(`trails/${encodeURIComponent(slug)}`), CACHE).then((r) => r.data));
}

export async function getNearbyTrails(slug: string) {
  return (await api<{ data: Trail[] }>(await url(`trails/${encodeURIComponent(slug)}/nearby`), CACHE)).data;
}

export async function getPlaces(query: PlaceQuery = {}) {
  return api<Paginated<Place>>(await url("places", { per_page: 200, ...query }), CACHE);
}

export async function getPlace(slug: string) {
  return orNull(api<{ data: PlaceDetail }>(await url(`places/${encodeURIComponent(slug)}`), CACHE).then((r) => r.data));
}

export async function getNearbyPlaces(slug: string) {
  return (await api<{ data: Place[] }>(await url(`places/${encodeURIComponent(slug)}/nearby`), CACHE)).data;
}

export async function getMapData() {
  return api<MapData>(await url("map"), CACHE);
}

export async function getRegions() {
  return (await api<{ data: Region[] }>(await url("regions"), CACHE)).data;
}

export async function getGuides(query: { region?: string; language?: string; kind?: string; specialty?: string } = {}) {
  return (await api<{ data: Guide[] }>(await url("guides", query), CACHE)).data;
}

export async function getGuide(slug: string) {
  return orNull(api<{ data: GuideDetail }>(await url(`guides/${encodeURIComponent(slug)}`), CACHE).then((r) => r.data));
}

export async function getStats() {
  return (await api<{ data: Stats }>(await url("stats"), CACHE)).data;
}

export async function getOptions() {
  return (await api<{ data: Options }>(await url("options"), { next: { revalidate: 3600 } })).data;
}

/** Resolve to null instead of throwing, for non-critical page sections. */
export async function safe<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (e) {
    console.error("[api]", e instanceof Error ? e.message : e);
    return null;
  }
}
