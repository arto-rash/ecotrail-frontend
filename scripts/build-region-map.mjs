// Builds src/data/az-regions.json: SVG paths for Azerbaijan's 14 economic regions.
//
// Input: scripts/data/az-districts.geojson — OCHA COD-AB admin-1 boundaries (CC BY-IGO),
// simplified, with each district tagged by its economic region per the Presidential
// Decree of 7 July 2021. Run with: node scripts/build-region-map.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import mapshaper from "mapshaper";
import { geoMercator, geoPath } from "d3-geo";

const NAMES = {
  baku: ["Bakı", "Baku"],
  nakhchivan: ["Naxçıvan", "Nakhchivan"],
  "absheron-khizi": ["Abşeron-Xızı", "Absheron-Khizi"],
  "mountainous-shirvan": ["Dağlıq Şirvan", "Mountainous Shirvan"],
  "ganja-dashkasan": ["Gəncə-Daşkəsən", "Ganja-Dashkasan"],
  karabakh: ["Qarabağ", "Karabakh"],
  "gazakh-tovuz": ["Qazax-Tovuz", "Gazakh-Tovuz"],
  "guba-khachmaz": ["Quba-Xaçmaz", "Guba-Khachmaz"],
  "lankaran-astara": ["Lənkəran-Astara", "Lankaran-Astara"],
  "central-aran": ["Mərkəzi Aran", "Central Aran"],
  "mil-mughan": ["Mil-Muğan", "Mil-Mughan"],
  "shaki-zagatala": ["Şəki-Zaqatala", "Shaki-Zagatala"],
  "east-zangezur": ["Şərqi Zəngəzur", "East Zangezur"],
  "shirvan-salyan": ["Şirvan-Salyan", "Shirvan-Salyan"],
};

// Hand-placed label anchors where the automatic interior points put neighbouring pills on top of each other.
const LABEL_OVERRIDES = {
  "mountainous-shirvan": [492, 214],
  "absheron-khizi": [650, 190],
};

const WIDTH = 800;
const HEIGHT = 560;

const input = await readFile(new URL("./data/az-districts.geojson", import.meta.url), "utf8");

async function run(commands) {
  const out = await mapshaper.applyCommands(commands, { "in.geojson": input });
  return JSON.parse(out["out.json"]);
}

// d3-geo wants clockwise exterior rings, the opposite of RFC 7946 GeoJSON, so reverse them.
function rewind(collection) {
  for (const f of collection.features) {
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) poly.forEach((ring) => ring.reverse());
  }
  return collection;
}

const regions = rewind(await run("-i in.geojson -dissolve region -o out.json format=geojson precision=0.0001"));
const anchors = await run("-i in.geojson -dissolve region -points inner -o out.json format=geojson precision=0.0001");

const projection = geoMercator().fitSize([WIDTH, HEIGHT], regions);
const path = geoPath(projection).digits(1);

const result = { width: WIDTH, height: HEIGHT, regions: {} };
for (const feature of regions.features) {
  const slug = feature.properties.region;
  const anchor = anchors.features.find((f) => f.properties.region === slug);
  const [x, y] = projection(anchor.geometry.coordinates);
  const [[minLng, minLat], [maxLng, maxLat]] = geoPath().bounds(feature);
  result.regions[slug] = {
    name: { az: NAMES[slug][0], en: NAMES[slug][1] },
    path: path(feature),
    label: LABEL_OVERRIDES[slug] ?? [Math.round(x), Math.round(y)],
    bounds: [minLng, minLat, maxLng, maxLat].map((n) => Math.round(n * 1e4) / 1e4),
  };
}

await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
await writeFile(new URL("../src/data/az-regions.json", import.meta.url), JSON.stringify(result) + "\n");
console.log(`Wrote ${Object.keys(result.regions).length} regions`);
