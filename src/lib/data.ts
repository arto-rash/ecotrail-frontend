import { api, ApiError } from "./api";
import type {
  Guide,
  Options,
  Paginated,
  Region,
  Stats,
  Trail,
  TrailDetail,
} from "./types";

const REVALIDATE = { next: { revalidate: 60 } };

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

function toQuery(query: TrailQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "" || value === false) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(`${key}[]`, v));
    else params.set(key, value === true ? "1" : String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function getTrails(query: TrailQuery = {}) {
  return api<Paginated<Trail>>(`trails${toQuery({ per_page: 100, ...query })}`, REVALIDATE);
}

export async function getTrail(slug: string): Promise<TrailDetail | null> {
  try {
    const res = await api<{ data: TrailDetail }>(`trails/${encodeURIComponent(slug)}`, REVALIDATE);
    return res.data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getNearbyTrails(slug: string) {
  return (await api<{ data: Trail[] }>(`trails/${encodeURIComponent(slug)}/nearby`, REVALIDATE)).data;
}

export async function getRegions() {
  return (await api<{ data: Region[] }>("regions", REVALIDATE)).data;
}

export async function getGuides() {
  return (await api<{ data: Guide[] }>("guides", REVALIDATE)).data;
}

export async function getStats() {
  return (await api<{ data: Stats }>("stats", REVALIDATE)).data;
}

export async function getOptions() {
  return (await api<{ data: Options }>("options", { next: { revalidate: 3600 } })).data;
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
