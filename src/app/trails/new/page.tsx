import type { Metadata } from "next";
import { TrailSubmitForm } from "@/components/trail-submit-form";
import { getOptions, getRegions, safe } from "@/lib/data";

export const metadata: Metadata = {
  title: "Share a trail",
  description: "Add a hiking trail to EcoTrail. Every submission is reviewed before publishing.",
};

export default async function NewTrailPage() {
  const [regions, options] = await Promise.all([safe(getRegions()), safe(getOptions())]);

  return (
    <div className="container-page max-w-3xl pt-10">
      <p className="text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">Share a trail</p>
      <h1 className="font-display-tight mt-2 text-4xl font-semibold text-forest-900 sm:text-5xl">Put your trail on the map</h1>
      <p className="mt-3 text-ink-700">
        Tell other hikers where you went. We review every submission for safety and accuracy before it goes live.
      </p>
      {regions && options ? (
        <TrailSubmitForm regions={regions} options={options} />
      ) : (
        <p className="mt-10 rounded-[var(--radius-card)] bg-pomegranate-100 p-6 font-semibold text-pomegranate-700">
          The submission service is unavailable right now. Please try again later.
        </p>
      )}
    </div>
  );
}
