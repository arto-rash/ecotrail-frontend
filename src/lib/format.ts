import type { Difficulty, RouteType } from "./types";

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatDistance(km: number): string {
  return `${Number.isInteger(km) ? km : km.toFixed(1)} km`;
}

export const DIFFICULTY: Record<Difficulty, { label: string; color: string; badge: string; blurb: string }> = {
  easy: {
    label: "Easy",
    color: "#4a855c",
    badge: "bg-moss-100 text-forest-700 ring-forest-600/20",
    blurb: "Gentle paths, fine for families",
  },
  moderate: {
    label: "Moderate",
    color: "#c9912a",
    badge: "bg-ochre-100 text-[#7a5410] ring-ochre-500/30",
    blurb: "Some climbing, decent fitness",
  },
  hard: {
    label: "Hard",
    color: "#b4432a",
    badge: "bg-pomegranate-100 text-pomegranate-700 ring-pomegranate-600/25",
    blurb: "Long days and steep ground",
  },
  expert: {
    label: "Expert",
    color: "#43334f",
    badge: "bg-plum-100 text-plum-700 ring-plum-700/25",
    blurb: "Serious mountain terrain",
  },
};

export const ROUTE_TYPE: Record<RouteType, string> = {
  loop: "Loop",
  out_and_back: "Out & back",
  point_to_point: "Point to point",
};

export const FEATURE_LABEL: Record<string, string> = {
  waterfall: "Waterfall",
  lake: "Lake",
  views: "Views",
  forest: "Forest",
  summit: "Summit",
  village: "Village",
  historic: "Historic",
  wildlife: "Wildlife",
  camping: "Camping",
  river: "River",
  canyon: "Canyon",
  spring_water: "Spring water",
};

export const DURATION_FILTERS = [
  { value: "90", label: "Under 1.5 h" },
  { value: "180", label: "Under 3 h" },
  { value: "300", label: "Under 5 h" },
];

export const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
