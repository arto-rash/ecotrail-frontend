"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus, LoaderCircle, MapPin, PartyPopper, Plus, X } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { TrailMap } from "./trail-map";
import { fill, localePath } from "@/i18n/config";
import { api, ApiError } from "@/lib/api";
import { DIFFICULTY_STYLE, cn } from "@/lib/format";
import type { Difficulty, Options } from "@/lib/types";

const STEP_FIELDS: Record<number, string[]> = {
  0: ["name", "village", "description", "difficulty", "route_type", "features"],
  1: ["lat", "lng", "distance_km", "duration_minutes", "ascent_m", "max_ele_m", "waypoints"],
  2: ["photos", "submitter_name", "submitter_email"],
};

type Form = {
  name: string;
  village: string;
  description: string;
  difficulty: Difficulty | "";
  route_type: string;
  features: string[];
  location: { lat: number; lng: number } | null;
  distance_km: string;
  hours: string;
  minutes: string;
  ascent_m: string;
  max_ele_m: string;
  waypoints: string[];
  submitter_name: string;
  submitter_email: string;
};

const EMPTY: Form = {
  name: "", village: "", description: "", difficulty: "", route_type: "out_and_back", features: [],
  location: null, distance_km: "", hours: "", minutes: "", ascent_m: "", max_ele_m: "", waypoints: [""],
  submitter_name: "", submitter_email: "",
};

type Errors = Record<string, string>;

export function TrailSubmitForm({ options }: { options: Options }) {
  const { locale, dict } = useI18n();
  const t = dict.submit;
  const STEPS = t.steps;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key as string];
      if (key === "location") { delete next.lat; delete next.lng; }
      if (key === "hours" || key === "minutes") delete next.duration_minutes;
      return next;
    });
  };

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  const durationMinutes = (Number(form.hours) || 0) * 60 + (Number(form.minutes) || 0);

  function validate(s: number): Errors {
    const e: Errors = {};
    if (s === 0) {
      if (form.name.trim().length < 3) e.name = t.errName;
      if (form.description.trim().length < 30) e.description = t.errDescription;
      if (!form.difficulty) e.difficulty = t.errDifficulty;
    }
    if (s === 1) {
      if (!form.location) e.lat = t.errTrailhead;
      if (!(Number(form.distance_km) > 0)) e.distance_km = t.errDistance;
      if (durationMinutes < 10) e.duration_minutes = t.errTime;
    }
    if (s === 2) {
      if (!form.submitter_name.trim()) e.submitter_name = t.errYourName;
      if (!/^\S+@\S+\.\S+$/.test(form.submitter_email)) e.submitter_email = t.errEmail;
    }
    return e;
  }

  function go(to: number) {
    setStep(to);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (!Object.keys(e).length) go(step + 1);
  }

  async function submit() {
    const e = validate(2);
    setErrors(e);
    if (Object.keys(e).length) return;

    const fd = new FormData();
    fd.set("name", form.name.trim());
    if (form.village.trim()) fd.set("village", form.village.trim());
    fd.set("description", form.description.trim());
    fd.set("difficulty", form.difficulty);
    fd.set("route_type", form.route_type);
    form.features.forEach((f) => fd.append("features[]", f));
    fd.set("lat", String(form.location!.lat));
    fd.set("lng", String(form.location!.lng));
    fd.set("distance_km", form.distance_km);
    fd.set("duration_minutes", String(durationMinutes));
    if (form.ascent_m) fd.set("ascent_m", form.ascent_m);
    if (form.max_ele_m) fd.set("max_ele_m", form.max_ele_m);
    form.waypoints.map((w) => w.trim()).filter(Boolean).forEach((w) => fd.append("waypoints[]", w));
    photos.forEach((p) => fd.append("photos[]", p.file));
    fd.set("submitter_name", form.submitter_name.trim());
    fd.set("submitter_email", form.submitter_email.trim());

    setSubmitting(true);
    try {
      await api(`trails?lang=${locale}`, { method: "POST", body: fd });
      setDone(true);
      top.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { errors?: Record<string, string[]> };
        const mapped: Errors = {};
        for (const [k, v] of Object.entries(body.errors ?? {})) mapped[k.split(".")[0]] = v[0];
        setErrors(mapped);
        const firstStep = [0, 1, 2].find((s) => STEP_FIELDS[s].some((f) => mapped[f]));
        if (firstStep !== undefined && firstStep !== step) go(firstStep);
      } else if (err instanceof ApiError && err.status === 429) {
        setErrors({ form: t.errTooMany });
      } else {
        setErrors({ form: t.errGeneric });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div ref={top} className="mt-10 overflow-hidden rounded-[2rem] bg-moss-100 p-8 text-center sm:p-14">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-forest-800 text-sand-50">
          <PartyPopper className="size-7" />
        </span>
        <h2 className="font-display-tight mt-6 text-4xl font-extrabold text-forest-900">{t.doneTitle}</h2>
        <p className="mx-auto mt-4 max-w-md text-ink-700">{fill(t.doneText, { name: form.name, email: form.submitter_email })}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={localePath(locale, "/trails")} className="rounded-full bg-forest-800 px-5 py-3 text-sm font-bold text-sand-50 hover:bg-forest-900">{t.exploreTrails}</Link>
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setPhotos([]); setStep(0); setDone(false); }}
            className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-900 ring-1 ring-sand-300"
          >
            {t.shareAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={top} className="mt-10 scroll-mt-24">
      {/* Stepper */}
      <ol className="mb-8 grid grid-cols-3 gap-2">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && go(i)}
              className="w-full text-left disabled:cursor-default"
            >
              <span className={cn("block h-1.5 rounded-full transition-colors", i <= step ? "bg-forest-700" : "bg-sand-200")} />
              <span className={cn("mt-2 flex items-center gap-1.5 text-xs font-bold sm:text-sm", i === step ? "text-forest-900" : "text-ink-400")}>
                {i < step ? <Check className="size-3.5 text-forest-600" /> : <span className="tabular-nums">{i + 1}.</span>}
                {label}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-sand-200 sm:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <Field label={t.name} error={errors.name} required>
              <input className={input(errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t.namePlaceholder} maxLength={120} />
            </Field>
            <Field label={t.village} error={errors.village}>
              <input className={input(errors.village)} value={form.village} onChange={(e) => set("village", e.target.value)} placeholder={t.villagePlaceholder} />
            </Field>
            <Field label={t.description} error={errors.description} required hint={t.descriptionHint}>
              <textarea className={cn(input(errors.description), "min-h-36 py-3")} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={5000} />
            </Field>
            <Field label={t.difficulty} error={errors.difficulty} required>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {options.difficulties.map((d) => {
                  const color = DIFFICULTY_STYLE[d.value as Difficulty].color;
                  const on = form.difficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("difficulty", d.value as Difficulty)}
                      className={cn("rounded-2xl p-3 text-left ring-1 transition", on ? "bg-forest-900 text-sand-50 ring-forest-900" : "bg-sand-50 ring-sand-200 hover:ring-sand-400")}
                    >
                      <span className="flex items-center gap-2 font-bold"><span className="size-2.5 rounded-full" style={{ background: color }} />{d.label}</span>
                      <span className={cn("mt-1 block text-xs", on ? "text-sand-200" : "text-ink-500")}>{dict.difficultyBlurb[d.value as Difficulty]}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label={t.routeType}>
              <div className="inline-flex flex-wrap rounded-full bg-sand-100 p-1">
                {options.route_types.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    aria-pressed={form.route_type === r.value}
                    onClick={() => set("route_type", r.value)}
                    className={cn("rounded-full px-4 py-2 text-sm font-bold transition", form.route_type === r.value ? "bg-white text-forest-900 shadow-sm" : "text-ink-500")}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={t.features} hint={t.featuresHint}>
              <div className="flex flex-wrap gap-2">
                {options.features.map((f) => {
                  const on = form.features.includes(f.value);
                  return (
                    <button
                      key={f.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("features", on ? form.features.filter((x) => x !== f.value) : [...form.features, f.value])}
                      className={cn("inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-bold ring-1 transition", on ? "bg-moss-100 text-forest-800 ring-forest-600" : "bg-white text-ink-700 ring-sand-200 hover:ring-sand-400")}
                    >
                      {on && <Check className="size-3.5" />}{f.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <Field label={t.trailhead} error={errors.lat || errors.lng} required hint={t.trailheadHint}>
              <TrailMap
                pick={{ value: form.location, onChange: (v) => set("location", v) }}
                className={cn("h-80 rounded-2xl ring-1", errors.lat ? "ring-pomegranate-500" : "ring-sand-200")}
              />
              {form.location && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">
                  <MapPin className="size-4" /> {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
                </p>
              )}
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label={t.distance} error={errors.distance_km} required>
                <input className={input(errors.distance_km)} type="number" inputMode="decimal" min="0.1" step="0.1" value={form.distance_km} onChange={(e) => set("distance_km", e.target.value)} placeholder="7.5" />
              </Field>
              <Field label={t.time} error={errors.duration_minutes} required>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input className={cn(input(errors.duration_minutes), "pr-8")} type="number" inputMode="numeric" min="0" value={form.hours} onChange={(e) => set("hours", e.target.value)} placeholder="3" aria-label={t.hours} />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-500">{dict.common.h}</span>
                  </div>
                  <div className="relative flex-1">
                    <input className={cn(input(errors.duration_minutes), "pr-10")} type="number" inputMode="numeric" min="0" max="59" value={form.minutes} onChange={(e) => set("minutes", e.target.value)} placeholder="30" aria-label={t.minutes} />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-500">{dict.common.min}</span>
                  </div>
                </div>
              </Field>
              <Field label={t.ascent} error={errors.ascent_m}>
                <input className={input(errors.ascent_m)} type="number" inputMode="numeric" min="0" value={form.ascent_m} onChange={(e) => set("ascent_m", e.target.value)} placeholder="450" />
              </Field>
              <Field label={t.highest} error={errors.max_ele_m}>
                <input className={input(errors.max_ele_m)} type="number" inputMode="numeric" value={form.max_ele_m} onChange={(e) => set("max_ele_m", e.target.value)} placeholder="1350" />
              </Field>
            </div>
            <Field label={t.waypoints} error={errors.waypoints} hint={t.waypointsHint}>
              <div className="space-y-2">
                {form.waypoints.map((w, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sand-100 text-sm font-bold text-ink-500">{i + 1}</span>
                    <input
                      className={input()}
                      value={w}
                      onChange={(e) => set("waypoints", form.waypoints.map((x, j) => (j === i ? e.target.value : x)))}
                      placeholder={i === 0 ? t.waypointFirst : t.waypointNext}
                      maxLength={120}
                    />
                    {form.waypoints.length > 1 && (
                      <button type="button" aria-label={t.removeWaypoint} onClick={() => set("waypoints", form.waypoints.filter((_, j) => j !== i))} className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-500 hover:bg-sand-100">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
                {form.waypoints.length < 30 && (
                  <button type="button" onClick={() => set("waypoints", [...form.waypoints, ""])} className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-700 hover:text-forest-900">
                    <Plus className="size-4" /> {t.addWaypoint}
                  </button>
                )}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Field label={t.photos} error={errors.photos} hint={t.photosHint}>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((p, i) => (
                  <div key={p.url} className="group relative aspect-square overflow-hidden rounded-xl bg-sand-200">
                    <Image src={p.url} alt="" fill unoptimized className="object-cover" />
                    {i === 0 && <span className="absolute top-1.5 left-1.5 rounded-full bg-forest-900/80 px-2 py-0.5 text-[0.65rem] font-bold text-white">{t.cover}</span>}
                    <button
                      type="button"
                      aria-label={t.removePhoto}
                      onClick={() => setPhotos((ps) => ps.filter((x) => x.url !== p.url))}
                      className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                {photos.length < 10 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-sand-300 text-ink-500 transition hover:border-forest-600 hover:text-forest-700">
                    <ImagePlus className="size-6" />
                    <span className="text-xs font-bold">{t.addPhotos}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []).filter((f) => f.size <= 8 * 1024 * 1024);
                        setPhotos((ps) => [...ps, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))].slice(0, 10));
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label={t.yourName} error={errors.submitter_name} required>
                <input className={input(errors.submitter_name)} value={form.submitter_name} onChange={(e) => set("submitter_name", e.target.value)} autoComplete="name" />
              </Field>
              <Field label={t.email} error={errors.submitter_email} required hint={t.emailHint}>
                <input className={input(errors.submitter_email)} type="email" value={form.submitter_email} onChange={(e) => set("submitter_email", e.target.value)} autoComplete="email" />
              </Field>
            </div>
          </div>
        )}

        {errors.form && <p className="mt-6 rounded-xl bg-pomegranate-100 px-4 py-3 text-sm font-semibold text-pomegranate-700">{errors.form}</p>}

        <div className="mt-8 flex items-center justify-between border-t border-sand-200 pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold text-ink-700 hover:bg-sand-100">
              <ArrowLeft className="size-4" /> {dict.common.back}
            </button>
          ) : <span />}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-sand-50 hover:bg-forest-900">
              {dict.common.next} <ArrowRight className="size-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-pomegranate-600 px-6 py-3 text-sm font-bold text-white hover:bg-pomegranate-700 disabled:opacity-60">
              {submitting && <LoaderCircle className="size-4 animate-spin" />}
              {t.submitButton}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-ink-900">
        {label}
        {required && <span className="text-pomegranate-600"> *</span>}
      </p>
      {children}
      {error ? <p className="mt-1.5 text-sm font-semibold text-pomegranate-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

function input(error?: string) {
  return cn(
    "h-11 w-full rounded-xl bg-sand-50 px-3.5 text-sm font-medium ring-1 outline-none transition placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-forest-600",
    error ? "ring-pomegranate-500" : "ring-sand-200",
  );
}
