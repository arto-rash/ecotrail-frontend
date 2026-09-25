import type { Metadata } from "next";
import { Suspense } from "react";
import { Info } from "lucide-react";
import { GuideApplicationForm } from "@/components/guide-application-form";
import { GuideCard } from "@/components/guide-card";
import { GuideFilters } from "@/components/guide-filters";
import { getDictionary } from "@/i18n/dictionaries";
import { getGuides, getOptions, getRegions, safe } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.guides.title, description: dict.guides.intro };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function GuidesPage({ searchParams }: PageProps<"/[lang]/guides">) {
  const [dict, sp] = await Promise.all([getDictionary(), searchParams]);
  const [guides, regions, options] = await Promise.all([
    safe(getGuides({ region: one(sp.region), language: one(sp.language), kind: one(sp.kind) })),
    safe(getRegions()),
    safe(getOptions()),
  ]);
  const g = dict.guides;

  return (
    <div className="container-page pt-10">
      <p className="text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">{g.eyebrow}</p>
      <h1 className="font-display-tight mt-2 text-4xl font-semibold text-forest-900 sm:text-5xl">{g.title}</h1>
      <p className="mt-3 max-w-2xl text-ink-700">{g.intro}</p>

      <div className="mt-8">
        <Suspense>
          <GuideFilters regions={regions ?? []} languages={options?.guide_languages ?? []} />
        </Suspense>
      </div>

      {guides?.some((guide) => guide.is_sample) && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-ochre-100 px-4 py-3 text-sm font-semibold text-[#7a5410]">
          <Info className="mt-0.5 size-4 shrink-0" /> {g.sampleNote}
        </p>
      )}

      {guides && guides.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {guides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
        </div>
      ) : (
        <p className="mt-6 rounded-[var(--radius-card)] border border-dashed border-sand-300 p-6 text-ink-700">{guides ? g.noMatch : g.none}</p>
      )}

      <section id="apply" className="mt-14 grid scroll-mt-24 gap-8 rounded-[2rem] bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-sand-200 sm:p-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="font-display-tight text-3xl font-semibold text-forest-900">{g.applyTitle}</h2>
          <p className="mt-3 text-ink-700">{g.applyIntro}</p>
        </div>
        {options && <GuideApplicationForm regions={regions ?? []} options={options} />}
      </section>
    </div>
  );
}
