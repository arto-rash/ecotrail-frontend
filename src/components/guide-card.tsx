"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Languages, Route } from "lucide-react";
import { GuideAvatar } from "./guide-avatar";
import { useI18n } from "./i18n-provider";
import { Rating } from "./rating";
import { fill, localePath } from "@/i18n/config";
import type { Guide } from "@/lib/types";

export function GuideCard({ guide }: { guide: Guide }) {
  const { locale, dict } = useI18n();
  const g = dict.guides;
  const tours = guide.tours_count ?? 0;
  const specialties = guide.specialties ?? [];
  const languages = guide.languages ?? [];
  const regions = guide.regions ?? [];

  return (
    <Link
      href={localePath(locale, `/guides/${guide.slug}`)}
      className={`group flex flex-col rounded-[var(--radius-card)] bg-white p-6 ring-1 transition hover:-translate-y-0.5 sm:p-7 ${guide.is_sample ? "border border-dashed border-sand-300 ring-transparent" : "shadow-[var(--shadow-card)] ring-sand-200 hover:shadow-[var(--shadow-lift)]"}`}
    >
      <div className="flex items-start gap-4">
        <GuideAvatar name={guide.name} photo={guide.photo} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display-tight text-2xl font-semibold text-ink-900 group-hover:text-forest-800">{guide.name}</h2>
            {guide.is_sample && <span className="rounded-full bg-ochre-100 px-2 py-0.5 text-xs font-bold text-[#7a5410]">{g.sample}</span>}
            {guide.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2 py-0.5 text-xs font-bold text-forest-700"><BadgeCheck className="size-3.5" /> {g.verified}</span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {guide.kind === "agency" ? g.agency : g.guide}
            {regions.length ? ` · ${regions.map((r) => r.name).join(", ")}` : ""}
          </p>
          <Rating value={guide.rating} count={guide.reviews_count} className="mt-1 text-ink-700" />
        </div>
      </div>

      {guide.headline && <p className="mt-5 font-semibold text-forest-800">{guide.headline}</p>}
      {specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {specialties.map((s) => (
            <span key={s.value} className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-bold text-ink-700">{s.label}</span>
          ))}
        </div>
      )}

      {/* The divider gets its own padding so it never sits right under the text. */}
      <div className="mt-auto pt-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-sand-200 pt-4 text-sm text-ink-700">
          {guide.experience_years ? <span className="font-semibold">{guide.experience_years === 1 ? g.yearsOne : fill(g.years, { count: guide.experience_years })}</span> : null}
          {tours > 0 && <span className="inline-flex items-center gap-1"><Route className="size-4" />{tours === 1 ? g.toursCountOne : fill(g.toursCount, { count: tours })}</span>}
          {languages.length > 0 && <span className="inline-flex items-center gap-1"><Languages className="size-4" />{languages.map((l) => l.code.toUpperCase()).join(" · ")}</span>}
          <span className="ml-auto inline-flex items-center gap-2">
            {guide.price_from_azn !== null && (
              <span className="text-ink-500">{g.from} <b className="text-base text-ink-900">{guide.price_from_azn} ₼</b> {guide.price_unit?.label}</span>
            )}
            <ArrowRight className="size-4 text-forest-700 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
