import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import credits from "../../../../public/images/trails/credits.json";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.sources.title, description: dict.sources.intro };
}

export default async function SourcesPage() {
  const dict = await getDictionary();
  const s = dict.sources;

  return (
    <div className="container-page max-w-4xl pt-10">
      <h1 className="font-display-tight text-4xl font-semibold text-forest-900 sm:text-5xl">{s.title}</h1>
      <p className="mt-3 text-ink-700">{s.intro}</p>

      <h2 className="font-display-tight mt-10 text-2xl font-semibold text-forest-900">{s.dataTitle}</h2>
      <ul className="mt-4 divide-y divide-sand-200 rounded-[var(--radius-card)] bg-white ring-1 ring-sand-200">
        {s.data.map((d) => (
          <li key={d.name} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-forest-800 hover:underline">{d.name} <ExternalLink className="size-3.5" /></a>
              <p className="text-sm text-ink-700">{d.what}</p>
            </div>
            <span className="text-xs font-semibold text-ink-500 sm:text-right">{d.license}</span>
          </li>
        ))}
      </ul>

      <h2 className="font-display-tight mt-10 text-2xl font-semibold text-forest-900">{s.methodTitle}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-700">
        {s.method.map((m) => <li key={m}>{m}</li>)}
      </ul>

      <h2 className="font-display-tight mt-10 text-2xl font-semibold text-forest-900">{s.photosTitle}</h2>
      <p className="mt-2 text-ink-700">{s.photosIntro}</p>
      <ul className="mt-4 divide-y divide-sand-200 rounded-[var(--radius-card)] bg-white ring-1 ring-sand-200">
        {Object.entries(credits).map(([slug, c]) => (
          <li key={slug} className="flex items-center gap-4 p-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand-200">
              <Image src={`/images/trails/${slug}.jpg`} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm">
              <a href={c.source} target="_blank" rel="noreferrer" className="block truncate font-bold text-forest-800 hover:underline">{c.title}</a>
              <p className="text-ink-500">{c.author} · {c.license}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
