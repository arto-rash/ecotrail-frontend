"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus, LoaderCircle, MapPin, PartyPopper, Plus, X } from "lucide-react";
import { TrailMap } from "./trail-map";
import { api, ApiError } from "@/lib/api";
import { DIFFICULTY, cn } from "@/lib/format";
import type { Difficulty, Options, Region } from "@/lib/types";

const STEPS = ["The basics", "Route & location", "Photos & you"] as const;

const STEP_FIELDS: Record<number, string[]> = {
  0: ["name", "region_id", "village", "description", "difficulty", "route_type", "features"],
  1: ["lat", "lng", "distance_km", "duration_minutes", "elevation_gain_m", "max_altitude_m", "waypoints"],
  2: ["photos", "submitter_name", "submitter_email"],
};

type Form = {
  name: string;
  region_id: string;
  village: string;
  description: string;
  difficulty: Difficulty | "";
  route_type: string;
  features: string[];
  location: { lat: number; lng: number } | null;
  distance_km: string;
  hours: string;
  minutes: string;
  elevation_gain_m: string;
  max_altitude_m: string;
  waypoints: string[];
  submitter_name: string;
  submitter_email: string;
};

const EMPTY: Form = {
  name: "", region_id: "", village: "", description: "", difficulty: "", route_type: "out_and_back", features: [],
  location: null, distance_km: "", hours: "", minutes: "", elevation_gain_m: "", max_altitude_m: "", waypoints: [""],
  submitter_name: "", submitter_email: "",
};

type Errors = Record<string, string>;

export function TrailSubmitForm({ regions, options }: { regions: Region[]; options: Options }) {
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
      if (form.name.trim().length < 3) e.name = "Give the trail a name (at least 3 characters).";
      if (!form.region_id) e.region_id = "Choose a region.";
      if (form.description.trim().length < 30) e.description = "Describe the trail in at least 30 characters.";
      if (!form.difficulty) e.difficulty = "Pick a difficulty level.";
    }
    if (s === 1) {
      if (!form.location) e.lat = "Click the map to mark the trailhead.";
      if (!(Number(form.distance_km) > 0)) e.distance_km = "Enter the total distance.";
      if (durationMinutes < 10) e.duration_minutes = "Enter how long the hike takes.";
    }
    if (s === 2) {
      if (!form.submitter_name.trim()) e.submitter_name = "Tell us your name.";
      if (!/^\S+@\S+\.\S+$/.test(form.submitter_email)) e.submitter_email = "Enter a valid email so we can notify you.";
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
    fd.set("region_id", form.region_id);
    if (form.village.trim()) fd.set("village", form.village.trim());
    fd.set("description", form.description.trim());
    fd.set("difficulty", form.difficulty);
    fd.set("route_type", form.route_type);
    form.features.forEach((f) => fd.append("features[]", f));
    fd.set("lat", String(form.location!.lat));
    fd.set("lng", String(form.location!.lng));
    fd.set("distance_km", form.distance_km);
    fd.set("duration_minutes", String(durationMinutes));
    if (form.elevation_gain_m) fd.set("elevation_gain_m", form.elevation_gain_m);
    if (form.max_altitude_m) fd.set("max_altitude_m", form.max_altitude_m);
    form.waypoints.map((w) => w.trim()).filter(Boolean).forEach((w) => fd.append("waypoints[]", w));
    photos.forEach((p) => fd.append("photos[]", p.file));
    fd.set("submitter_name", form.submitter_name.trim());
    fd.set("submitter_email", form.submitter_email.trim());

    setSubmitting(true);
    try {
      await api("trails", { method: "POST", body: fd });
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
        setErrors({ form: "You've shared a lot of trails in a short time. Please try again in an hour." });
      } else {
        setErrors({ form: "Something went wrong sending your trail. Please try again." });
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
        <h2 className="font-display-tight mt-6 text-4xl font-semibold text-forest-900">You&apos;re amazing!</h2>
        <p className="mx-auto mt-4 max-w-md text-ink-700">
          Thanks for sharing your adventure with the community. Our team is reviewing <b>{form.name}</b> to make sure it&apos;s safe, accurate and ready for other hikers.
          We&apos;ll email <b>{form.submitter_email}</b> as soon as it&apos;s published.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/trails" className="rounded-full bg-forest-800 px-5 py-3 text-sm font-bold text-sand-50 hover:bg-forest-900">Explore trails</Link>
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setPhotos([]); setStep(0); setDone(false); }}
            className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-900 ring-1 ring-sand-300"
          >
            Share another
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
            <Field label="Trail name" error={errors.name} required>
              <input className={input(errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Qaranohur Lake" maxLength={120} />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Region" error={errors.region_id} required>
                <select className={input(errors.region_id)} value={form.region_id} onChange={(e) => set("region_id", e.target.value)}>
                  <option value="">Choose a region</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Field>
              <Field label="Nearest village" error={errors.village}>
                <input className={input(errors.village)} value={form.village} onChange={(e) => set("village", e.target.value)} placeholder="e.g. Talistan" />
              </Field>
            </div>
            <Field label="Description" error={errors.description} required hint="What makes it special? Terrain, water sources, tricky sections, where to park.">
              <textarea className={cn(input(errors.description), "min-h-36 py-3")} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={5000} />
            </Field>
            <Field label="Difficulty" error={errors.difficulty} required>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {options.difficulties.map((d) => {
                  const meta = DIFFICULTY[d.value as Difficulty];
                  const on = form.difficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("difficulty", d.value as Difficulty)}
                      className={cn("rounded-2xl p-3 text-left ring-1 transition", on ? "bg-forest-900 text-sand-50 ring-forest-900" : "bg-sand-50 ring-sand-200 hover:ring-sand-400")}
                    >
                      <span className="flex items-center gap-2 font-bold"><span className="size-2.5 rounded-full" style={{ background: meta.color }} />{d.label}</span>
                      <span className={cn("mt-1 block text-xs", on ? "text-sand-200" : "text-ink-500")}>{meta.blurb}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Route type">
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
            <Field label="Features & highlights" hint="Select all that apply.">
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
            <Field label="Trailhead" error={errors.lat || errors.lng} required hint="Click the map where the hike starts. Drag the pin to adjust.">
              <TrailMap
                trails={[]}
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
              <Field label="Distance (km)" error={errors.distance_km} required>
                <input className={input(errors.distance_km)} type="number" inputMode="decimal" min="0.1" step="0.1" value={form.distance_km} onChange={(e) => set("distance_km", e.target.value)} placeholder="7.5" />
              </Field>
              <Field label="Time to complete" error={errors.duration_minutes} required>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input className={cn(input(errors.duration_minutes), "pr-8")} type="number" inputMode="numeric" min="0" value={form.hours} onChange={(e) => set("hours", e.target.value)} placeholder="3" aria-label="Hours" />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-500">h</span>
                  </div>
                  <div className="relative flex-1">
                    <input className={cn(input(errors.duration_minutes), "pr-10")} type="number" inputMode="numeric" min="0" max="59" value={form.minutes} onChange={(e) => set("minutes", e.target.value)} placeholder="30" aria-label="Minutes" />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-500">min</span>
                  </div>
                </div>
              </Field>
              <Field label="Elevation gain (m)" error={errors.elevation_gain_m}>
                <input className={input(errors.elevation_gain_m)} type="number" inputMode="numeric" min="0" value={form.elevation_gain_m} onChange={(e) => set("elevation_gain_m", e.target.value)} placeholder="450" />
              </Field>
              <Field label="Highest point (m)" error={errors.max_altitude_m}>
                <input className={input(errors.max_altitude_m)} type="number" inputMode="numeric" value={form.max_altitude_m} onChange={(e) => set("max_altitude_m", e.target.value)} placeholder="1350" />
              </Field>
            </div>
            <Field label="Key waypoints" error={errors.waypoints} hint="Landmarks hikers will pass, in order — springs, junctions, viewpoints.">
              <div className="space-y-2">
                {form.waypoints.map((w, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sand-100 text-sm font-bold text-ink-500">{i + 1}</span>
                    <input
                      className={input()}
                      value={w}
                      onChange={(e) => set("waypoints", form.waypoints.map((x, j) => (j === i ? e.target.value : x)))}
                      placeholder={i === 0 ? "e.g. Village trailhead" : "Next landmark"}
                      maxLength={120}
                    />
                    {form.waypoints.length > 1 && (
                      <button type="button" aria-label="Remove waypoint" onClick={() => set("waypoints", form.waypoints.filter((_, j) => j !== i))} className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-500 hover:bg-sand-100">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
                {form.waypoints.length < 30 && (
                  <button type="button" onClick={() => set("waypoints", [...form.waypoints, ""])} className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-700 hover:text-forest-900">
                    <Plus className="size-4" /> Add waypoint
                  </button>
                )}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Field label="Photos" error={errors.photos} hint="Up to 10 images, 8 MB each. The first one becomes the cover.">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((p, i) => (
                  <div key={p.url} className="group relative aspect-square overflow-hidden rounded-xl bg-sand-200">
                    <Image src={p.url} alt="" fill unoptimized className="object-cover" />
                    {i === 0 && <span className="absolute top-1.5 left-1.5 rounded-full bg-forest-900/80 px-2 py-0.5 text-[0.65rem] font-bold text-white">Cover</span>}
                    <button
                      type="button"
                      aria-label="Remove photo"
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
                    <span className="text-xs font-bold">Add photos</span>
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
              <Field label="Your name" error={errors.submitter_name} required>
                <input className={input(errors.submitter_name)} value={form.submitter_name} onChange={(e) => set("submitter_name", e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Email" error={errors.submitter_email} required hint="Only used to tell you when your trail is live.">
                <input className={input(errors.submitter_email)} type="email" value={form.submitter_email} onChange={(e) => set("submitter_email", e.target.value)} autoComplete="email" />
              </Field>
            </div>
          </div>
        )}

        {errors.form && <p className="mt-6 rounded-xl bg-pomegranate-100 px-4 py-3 text-sm font-semibold text-pomegranate-700">{errors.form}</p>}

        <div className="mt-8 flex items-center justify-between border-t border-sand-200 pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold text-ink-700 hover:bg-sand-100">
              <ArrowLeft className="size-4" /> Back
            </button>
          ) : <span />}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-sand-50 hover:bg-forest-900">
              Next <ArrowRight className="size-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-pomegranate-600 px-6 py-3 text-sm font-bold text-white hover:bg-pomegranate-700 disabled:opacity-60">
              {submitting && <LoaderCircle className="size-4 animate-spin" />}
              Submit for review
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
