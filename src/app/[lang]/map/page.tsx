import type { Metadata } from "next";
import { MapExplorer } from "@/components/map-explorer";
import { getDictionary } from "@/i18n/dictionaries";
import { getMapData, getRegions, safe } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.map.title, description: dict.home.mapDescription };
}

export default async function MapPage({ searchParams }: PageProps<"/[lang]/map">) {
  const [dict, sp] = await Promise.all([getDictionary(), searchParams]);
  const [data, regions] = await Promise.all([safe(getMapData()), safe(getRegions())]);
  const region = typeof sp.region === "string" ? sp.region : null;

  if (!data || !regions) {
    return <p className="container-page mt-10 rounded-[var(--radius-card)] bg-pomegranate-100 p-6 font-semibold text-pomegranate-700">{dict.common.unavailable}</p>;
  }
  return <MapExplorer data={data} regions={regions} initialRegion={region && regions.some((r) => r.slug === region) ? region : null} />;
}
