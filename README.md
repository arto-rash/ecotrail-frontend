# EcoTrail — Frontend

Next.js 16 (App Router) web app for EcoTrail, a hiking-trail guide to Azerbaijan. Talks to the Laravel API in [`ecotrail-backend`](https://github.com/arto-rash/ecotrail-backend).

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS v4
- [MapLibre GL](https://maplibre.org/) with free [OpenFreeMap](https://openfreemap.org/) tiles (no API key)
- Fonts: Fraunces (display) and Manrope (text) via `next/font`

## Pages

| Route | What it does |
|---|---|
| `/` | Hero search, featured trails, regions, map, eco-principles, guides |
| `/trails` | Search and filter (region, difficulty, duration, features, sort), list + map split view; `?view=map` for map-only on mobile |
| `/trails/[slug]` | Trail detail: gallery, stats, waypoints, best months, reviews, trailhead map, directions, nearby trails |
| `/trails/new` | Three-step "share a trail" form with a click-to-place trailhead map and photo upload |
| `/guides` | Partner guides and agencies, filterable by region |
| `/challenges` | Eco-challenges and Leave No Trace principles |
| `/credits` | Photo attributions (Wikimedia Commons) |

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
