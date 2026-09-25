import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Languages, MapPin, Star } from "lucide-react";
import { Monogram } from "@/components/monogram";
import { getGuides, getRegions, safe } from "@/lib/data";
import { cn } from "@/lib/format";

export const metadata: Metadata = {
  title: "Local guides",
  description: "Partner guides and tour agencies for hiking in Azerbaijan.",
};

export default async function GuidesPage({ searchParams }: PageProps<"/guides">) {
  const { region } = await searchParams;
  const [guides, regions] = await Promise.all([safe(getGuides()), safe(getRegions())]);
  const list = (guides ?? []).filter((g) => !region || g.region?.slug === region);
  const withGuides = (regions ?? []).filter((r) => guides?.some((g) => g.region?.slug === r.slug));

  return (
    <div className="container-page pt-10">
      <p className="text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">Go with a local</p>
      <h1 className="font-display-tight mt-2 text-4xl font-semibold text-forest-900 sm:text-5xl">Professional guides</h1>
      <p className="mt-3 max-w-2xl text-ink-700">
        Our partner guides and tour agencies make mountain days safer and easier — they handle transport, permits and the route, and know every village along the way.
      </p>

      <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <RegionChip href="/guides" active={!region} label="All regions" />
        {withGuides.map((r) => (
          <RegionChip key={r.slug} href={`/guides?region=${r.slug}`} active={region === r.slug} label={r.name} />
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {list.map((g) => (
          <article key={g.slug} className="flex flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-sand-200 sm:p-7">
            <div className="flex items-start gap-4">
              <Monogram name={g.name} className="size-16 text-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display-tight text-2xl font-semibold text-ink-900">{g.name}</h2>
                  {g.is_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2 py-0.5 text-xs font-bold text-forest-700">
                      <BadgeCheck className="size-3.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{g.region?.name}</span>
                  <span>{g.kind === "agency" ? "Tour agency" : "Independent guide"}</span>
                </p>
              </div>
            </div>
            <p className="mt-5 font-semibold text-forest-800">{g.headline}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{g.bio}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {g.specialties.map((s) => (
                <span key={s} className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-bold text-ink-700">{s}</span>
              ))}
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-sand-200 pt-4 text-sm">
              <span className="inline-flex items-center gap-1 font-bold"><Star className="size-4 fill-ochre-500 text-ochre-500" />{g.rating.toFixed(1)}</span>
              <span className="text-ink-500">{g.trips_count.toLocaleString("en")} trips</span>
              <span className="inline-flex items-center gap-1 text-ink-500"><Languages className="size-4" />{g.languages.join(", ")}</span>
              {g.price_from_azn && <span className="ml-auto text-ink-500">from <b className="text-lg text-ink-900">{g.price_from_azn} ₼</b> / person</span>}
            </div>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-ink-500">Online booking is coming soon. Want to be listed as a guide? Get in touch through the trail submission form.</p>
    </div>
  );
}

function RegionChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-bold ring-1 transition",
        active ? "bg-forest-800 text-sand-50 ring-forest-800" : "bg-white text-ink-700 ring-sand-200 hover:ring-sand-400",
      )}
    >
      {label}
    </Link>
  );
}
