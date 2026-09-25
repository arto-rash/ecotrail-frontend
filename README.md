# EcoTrail — Frontend

Next.js 16 (App Router) web app for EcoTrail, a hiking-trail guide to Azerbaijan. Talks to the Laravel API in [`ecotrail-backend`](https://github.com/arto-rash/ecotrail-backend).

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS v4
- [MapLibre GL](https://maplibre.org/) with free [OpenFreeMap](https://openfreemap.org/) tiles (no API key)
- Fonts: Fraunces (display) and Manrope (text) via `next/font`

## Languages

Every page lives under `/az/...` or `/en/...` (`src/app/[lang]`). `src/proxy.ts` sends bare URLs to the
visitor's language (cookie → `Accept-Language` → Azerbaijani). UI strings are in
`src/dictionaries/{az,en}.json`; server components use `getDictionary()`, client components `useI18n()`.

## Pages

| Route | What it does |
|---|---|
| `/[lang]` | Hero search, mapped trails, clickable region map, places, map teaser, eco tips |
| `/[lang]/trails` · `/[lang]/places` | Explore tabs: search, filters, region picker, card grid |
| `/[lang]/trails/[slug]` | Route map, elevation profile, places along the way, reviews, sources |
| `/[lang]/places/[slug]` | Photo, facts, Wikipedia excerpt, map, nearby trails and places, reviews |
| `/[lang]/map` | Full-screen map: 14 economic regions (SVG) or terrain (MapLibre) with an in-view list |
| `/[lang]/trails/new` | Share-a-trail form with a click-to-place trailhead |
| `/[lang]/guides` | Verified partner guides and the partner application |
| `/[lang]/challenges` · `/[lang]/sources` | Eco-challenges; data sources, method and photo credits |

Any location line opens that point in Google Maps; right-click (or long-press) on the terrain map
opens any spot.

## Region map

`src/data/az-regions.json` holds pre-projected SVG paths for the 14 economic regions (2021 decree),
built from OCHA COD-AB district boundaries with `node scripts/build-region-map.mjs`.

## Development

```sh
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the API
npm install
npm run dev
```

`npm run dev` / `npm run build` first copy the MapLibre web worker into `public/maplibre/` (bundlers don't emit it).

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Public API base URL, e.g. `https://api.example.com/api` |
| `API_INTERNAL_URL` | Optional server-side API URL (e.g. `http://api:8080/api` inside Docker) |

## Deploying to Vercel

Import the repo and set `NEXT_PUBLIC_API_URL`. Add the Vercel domain to the backend's `CORS_ALLOWED_ORIGINS` so the trail submission form can post to the API.

## Photos

Trail photos in `public/images/trails/` come from Wikimedia Commons under CC BY / CC BY-SA / CC0; see `credits.json` and the `/credits` page.
