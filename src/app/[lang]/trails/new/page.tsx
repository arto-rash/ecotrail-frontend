import type { Metadata } from "next";
import { TrailSubmitForm } from "@/components/trail-submit-form";
import { getDictionary } from "@/i18n/dictionaries";
import { getOptions, safe } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.submit.eyebrow, description: dict.submit.intro };
}

export default async function NewTrailPage() {
  const [dict, options] = await Promise.all([getDictionary(), safe(getOptions())]);
  const s = dict.submit;

  return (
    <div className="container-page max-w-3xl pt-10">
      <p className="text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">{s.eyebrow}</p>
      <h1 className="font-display-tight mt-2 text-4xl font-extrabold text-forest-900 sm:text-5xl">{s.title}</h1>
      <p className="mt-3 text-ink-700">{s.intro}</p>
      {options ? (
        <TrailSubmitForm options={options} />
      ) : (
        <p className="mt-10 rounded-[var(--radius-card)] bg-pomegranate-100 p-6 font-semibold text-pomegranate-700">{s.unavailable}</p>
      )}
    </div>
  );
}
