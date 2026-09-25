export type Difficulty = "easy" | "moderate" | "hard" | "expert";
export type RouteType = "loop" | "out_and_back" | "point_to_point";

export interface Region {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  trails_count?: number;
}

export interface Trail {
  id: number;
  slug: string;
  name: string;
  region?: Region;
  village: string | null;
  summary: string;
  difficulty: Difficulty;
  route_type: RouteType;
  distance_km: number;
  duration_minutes: number;
  elevation_gain_m: number | null;
  max_altitude_m: number | null;
  location: { lat: number; lng: number };
  cover_image: string | null;
  features: string[];
  offline_map: boolean;
  is_featured: boolean;
  rating?: number | null;
  reviews_count?: number;
}

export interface Review {
  id: number;
  author_name: string;
  rating: number;
  body: string;
  hiked_on: string | null;
}

export interface TrailDetail extends Trail {
  description: string;
  gallery: string[];
  best_months: number[];
  waypoints: string[];
  reviews: Review[];
}

export interface Guide {
  id: number;
  slug: string;
  name: string;
  kind: "guide" | "agency";
  headline: string;
  bio: string;
  languages: string[];
  specialties: string[];
  region?: Region;
  rating: number;
  trips_count: number;
  price_from_azn: number | null;
  is_verified: boolean;
}

export interface Stats {
  trails: number;
  regions: number;
  total_km: number;
  reviews: number;
  guides: number;
}

export interface Option {
  value: string;
  label: string;
}

export interface Options {
  difficulties: Option[];
  route_types: Option[];
  features: Option[];
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

/** A trail reduced to what the map needs. */
export type MapTrail = Pick<Trail, "slug" | "name" | "difficulty" | "location" | "cover_image"> & {
  region?: string;
  distance_km?: number;
};
