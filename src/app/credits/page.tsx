import type { Metadata } from "next";
import Image from "next/image";
import { allCredits } from "@/lib/credits";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  return (
    <div className="container-page max-w-4xl pt-10">
      <h1 className="font-display-tight text-4xl font-semibold text-forest-900">Photo credits</h1>
      <p className="mt-3 text-ink-700">
        Trail photography comes from Wikimedia Commons contributors and is used under the licences listed below. Thank you to every photographer who shares their work.
      </p>
      <ul className="mt-8 divide-y divide-sand-200 rounded-[var(--radius-card)] bg-white ring-1 ring-sand-200">
        {allCredits.map(([slug, c]) => (
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
