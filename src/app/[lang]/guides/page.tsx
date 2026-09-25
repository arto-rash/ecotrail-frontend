import type { Metadata } from "next";
import { BadgeCheck, Globe, Languages, Mail, Phone } from "lucide-react";
import { GuideApplicationForm } from "@/components/guide-application-form";
import { Monogram } from "@/components/monogram";
import { getDictionary } from "@/i18n/dictionaries";
import { getGuides, getRegions, safe } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.guides.title, description: dict.guides.intro };
}

export default async function GuidesPage() {
  const [dict, guides, regions] = await Promise.all([getDictionary(), safe(getGuides()), safe(getRegions())]);
  const g = dict.guides;
  const regionName = Object.fromEntries((regions ?? []).map((r) => [r.slug, r.name]));

  return (
    <div className="container-page pt-10">
      <p className="text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">{g.eyebrow}</p>
      <h1 className="font-display-tight mt-2 text-4xl font-semibold text-forest-900 sm:text-5xl">{g.title}</h1>
      <p className="mt-3 max-w-2xl text-ink-700">{g.intro}</p>

      {guides && guides.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {guides.map((guide) => (
            <article key={guide.slug} className="flex flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-sand-200 sm:p-7">
              <div className="flex items-start gap-4">
                <Monogram name={guide.name} className="size-16 text-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display-tight text-2xl font-semibold text-ink-900">{guide.name}</h2>
                    {guide.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2 py-0.5 text-xs font-bold text-forest-700"><BadgeCheck className="size-3.5" /> {g.verified}</span>}
                  </div>
                  <p className="mt-1 text-sm text-ink-500">{guide.kind === "agency" ? g.agency : g.guide}{guide.regions.length ? ` · ${guide.regions.map((r) => regionName[r] ?? r).join(", ")}` : ""}</p>
                </div>
              </div>
              {guide.headline && <p className="mt-5 font-semibold text-forest-800">{guide.headline}</p>}
              {guide.bio && <p className="mt-2 text-sm leading-relaxed text-ink-700">{guide.bio}</p>}
              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-sand-200 pt-4 text-sm text-ink-700">
                {guide.languages.length > 0 && <span className="inline-flex items-center gap-1"><Languages className="size-4" />{guide.languages.join(", ")}</span>}
                {guide.email && <a href={`mailto:${guide.email}`} className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:underline"><Mail className="size-4" />{guide.email}</a>}
                {guide.phone && <a href={`tel:${guide.phone}`} className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:underline"><Phone className="size-4" />{guide.phone}</a>}
                {guide.website && <a href={guide.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:underline"><Globe className="size-4" />{new URL(guide.website).hostname}</a>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-[var(--radius-card)] border border-dashed border-sand-300 p-6 text-ink-700">{g.none}</p>
      )}

      <section id="apply" className="mt-14 scroll-mt-24 grid gap-8 rounded-[2rem] bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-sand-200 sm:p-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="font-display-tight text-3xl font-semibold text-forest-900">{g.applyTitle}</h2>
          <p className="mt-3 text-ink-700">{g.applyIntro}</p>
        </div>
        <GuideApplicationForm regions={regions ?? []} />
      </section>
    </div>
  );
}
