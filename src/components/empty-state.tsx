import Link from "next/link";
import { SearchX } from "lucide-react";

export function EmptyState({ title, hint, cta, href }: { title: string; hint: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-sand-300 px-6 py-16 text-center">
      <SearchX className="size-10 text-ink-400" />
      <p className="font-display-tight mt-4 text-2xl font-semibold text-forest-900">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-ink-500">{hint}</p>
      <Link href={href} className="mt-6 text-sm font-bold text-forest-700 hover:underline">{cta}</Link>
    </div>
  );
}
