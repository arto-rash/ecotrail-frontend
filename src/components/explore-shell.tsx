import Link from "next/link";
import { cn } from "@/lib/format";

/** Title + Trails/Places tabs shared by the two explore pages. */
export function ExploreShell({
  title,
  intro,
  tabs,
  children,
}: {
  title: string;
  intro: string;
  tabs: { href: string; label: string; active: boolean }[];
  children: React.ReactNode;
}) {
  return (
    <div className="container-page pt-8 lg:pt-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display-tight text-4xl font-semibold text-forest-900 sm:text-5xl">{title}</h1>
          <p className="mt-2 text-ink-700">{intro}</p>
        </div>
        <nav className="inline-flex self-start rounded-full bg-sand-200/70 p-1 sm:self-auto" aria-label={title}>
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={cn("rounded-full px-5 py-2 text-sm font-bold transition", t.active ? "bg-white text-forest-900 shadow-sm" : "text-ink-500 hover:text-ink-900")}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
