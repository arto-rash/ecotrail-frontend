import { ExternalLink } from "lucide-react";
import type { Source } from "@/lib/types";

export function SourcesList({ title, sources }: { title: string; sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <section>
      <h2 className="font-display-tight text-xl font-extrabold text-forest-900">{title}</h2>
      <ul className="mt-3 space-y-1.5 text-sm">
        {sources.map((s) => (
          <li key={s.url + s.label} className="flex flex-wrap items-baseline gap-x-2">
            <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:underline">
              {s.label} <ExternalLink className="size-3" />
            </a>
            <span className="text-xs text-ink-500">{s.license}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
