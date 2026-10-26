"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Check, ChevronDown, Clock, MapPin, Users } from "lucide-react";
import { DifficultyBadge } from "./difficulty-badge";
import { useI18n } from "./i18n-provider";
import { fill, localePath } from "@/i18n/config";
import { cn } from "@/lib/format";
import type { GuideTour } from "@/lib/types";

export function TourCard({ tour }: { tour: GuideTour }) {
  const { locale, dict } = useI18n();
  const t = dict.tours;
  const c = dict.common;
  const [open, setOpen] = useState(false);
  const unit = tour.duration_unit === "days" ? (tour.duration_value === 1 ? c.dayUnit : c.daysUnit) : tour.duration_value === 1 ? c.hourUnit : c.hoursUnit;
  const hasDetails = !!(tour.description || tour.includes.length || tour.meeting_point);

  return (
    <article className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-sand-200 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display-tight text-xl font-extrabold text-forest-900">{tour.title}</h3>
          {tour.summary && <p className="mt-1 text-sm text-ink-700">{tour.summary}</p>}
        </div>
        <p className="shrink-0 text-right">
          {tour.price_azn !== null ? (
            <>
              <span className="font-display-tight text-2xl font-extrabold text-ink-900">{tour.price_azn} ₼</span>
              <span className="block text-xs text-ink-500">{tour.price_unit?.label}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-ink-500">{dict.guides.priceOnRequest}</span>
          )}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-700">
        <DifficultyBadge difficulty={tour.difficulty} />
        <span className="inline-flex items-center gap-1"><Clock className="size-4" />{tour.duration_value} {unit}</span>
        {tour.group_size_max && <span className="inline-flex items-center gap-1"><Users className="size-4" />{fill(t.groupSize, { count: tour.group_size_max })}</span>}
        {tour.months.length > 0 && (
          <span className="inline-flex items-center gap-1" title={t.season}>
            <CalendarDays className="size-4" />
            {tour.months.length === 12 ? "✓ 12/12" : tour.months.map((m) => c.monthsShort[m - 1]).join(", ")}
          </span>
        )}
      </div>

      {tour.trails.length > 0 && (
        <div className="mt-4">
          <p className="text-[0.65rem] font-bold tracking-[0.14em] text-ink-500 uppercase">{t.trails}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tour.trails.map((tr) => (
              <Link key={tr.slug} href={localePath(locale, `/trails/${tr.slug}`)} className="rounded-full bg-moss-100 px-3 py-1 text-xs font-bold text-forest-800 hover:bg-moss-200">
                {tr.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {hasDetails && (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-forest-700 hover:text-forest-900">
            {open ? t.hideDetails : t.details}
            <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
          </button>
          {open && (
            <div className="mt-3 space-y-4 border-t border-sand-200 pt-4 text-sm text-ink-700">
              {tour.description && <p className="leading-relaxed whitespace-pre-line">{tour.description}</p>}
              {tour.includes.length > 0 && (
                <div>
                  <p className="font-bold text-ink-900">{t.includes}</p>
                  <ul className="mt-1.5 space-y-1">
                    {tour.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2"><Check className="size-4 text-forest-600" />{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tour.meeting_point && (
                <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 text-forest-600" /><span><b className="text-ink-900">{t.meetingPoint}:</b> {tour.meeting_point}</span></p>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}
