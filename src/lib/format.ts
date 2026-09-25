import type { Locale } from "@/i18n/config";
import type en from "@/dictionaries/en.json";
import type { Difficulty } from "./types";

type Dict = typeof en;

/**
 * Deterministic number formatting (Azerbaijani: 1.234,5 · English: 1,234.5). Intl's output
 * depends on the runtime's ICU data, which differs between Node and browsers and breaks hydration.
 */
export function formatNumber(locale: Locale, n: number, digits = 0): string {
  const factor = 10 ** digits;
  const rounded = Math.round(n * factor) / factor;
  const [int, frac] = Math.abs(rounded).toFixed(digits).split(".");
  const [group, decimal] = locale === "az" ? [".", ","] : [",", "."];
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const fraction = frac && Number(frac) !== 0 ? decimal + frac.replace(/0+$/, "") : "";
  return (rounded < 0 ? "-" : "") + grouped + fraction;
}

export function formatDuration(minutes: number, dict: Dict): string {
  const { h: hUnit, min: mUnit } = dict.common;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} ${mUnit}`;
  return m ? `${h} ${hUnit} ${m} ${mUnit}` : `${h} ${hUnit}`;
}

export function formatDistance(km: number, locale: Locale, dict: Dict): string {
  return `${formatNumber(locale, km, km < 10 ? 1 : 0)} ${dict.common.km}`;
}

export function formatMetres(m: number, locale: Locale, dict: Dict): string {
  return `${formatNumber(locale, m)} ${dict.common.m}`;
}

/** Colours and badge styles per difficulty; labels come from the dictionary. */
export const DIFFICULTY_STYLE: Record<Difficulty, { color: string; badge: string }> = {
  easy: { color: "#4a855c", badge: "bg-moss-100 text-forest-700 ring-forest-600/20" },
  moderate: { color: "#c9912a", badge: "bg-ochre-100 text-[#7a5410] ring-ochre-500/30" },
  hard: { color: "#b4432a", badge: "bg-pomegranate-100 text-pomegranate-700 ring-pomegranate-600/25" },
  expert: { color: "#43334f", badge: "bg-plum-100 text-plum-700 ring-plum-700/25" },
};

export const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "hard", "expert"];
export const FEATURES = ["waterfall", "lake", "summit", "village", "historic", "forest", "river", "views"] as const;
export const PLACE_TYPES = ["waterfall", "lake", "peak", "village", "historic", "park"] as const;
export const DURATIONS = ["90", "180", "300", "600"] as const;

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
