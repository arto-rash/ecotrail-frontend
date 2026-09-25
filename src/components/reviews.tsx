"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { Rating, StarRatingInput, Stars } from "./rating";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/format";
import type { Review } from "@/lib/types";

export function Reviews({
  kind,
  slug,
  initial,
  rating,
}: {
  kind: "trails" | "places" | "guides";
  slug: string;
  initial: Review[];
  rating?: number | null;
}) {
  const { locale, dict } = useI18n();
  const r = dict.reviews;
  const [reviews, setReviews] = useState(initial);
  const [form, setForm] = useState({ author_name: "", rating: 0, body: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const avg = reviews.length ? reviews.reduce((s, x) => s + x.rating, 0) / reviews.length : rating ?? null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    setMessage(null);
    try {
      const res = await api<{ data: Review }>(`${kind}/${encodeURIComponent(slug)}/reviews?lang=${locale}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setReviews((list) => [res.data, ...list]);
      setForm({ author_name: "", rating: 0, body: "", website: "" });
      setStatus("done");
      setMessage(r.thanks);
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { errors?: Record<string, string[]> };
        setErrors(Object.fromEntries(Object.entries(body.errors ?? {}).map(([k, v]) => [k, v[0]])));
      } else {
        setMessage(err instanceof ApiError && err.status === 429 ? r.tooMany : r.error);
      }
    }
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display-tight text-2xl font-semibold text-forest-900">{r.title}</h2>
        <Rating value={avg} count={reviews.length} className="text-ink-700" />
      </div>

      {reviews.length === 0 ? (
        <p className="mt-3 text-ink-500">{r.empty}</p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {reviews.map((rv) => (
            <li key={rv.id} className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-sand-200">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-full bg-sand-200 text-sm font-bold text-ink-700">{rv.author_name[0]?.toUpperCase()}</span>
                  <span>
                    <span className="block text-sm font-bold">{rv.author_name}</span>
                    <span className="block text-xs text-ink-500">
                      {dict.common.months[new Date(rv.created_at).getUTCMonth()]} {new Date(rv.created_at).getUTCFullYear()}
                    </span>
                  </span>
                </span>
                <Stars value={rv.rating} />
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-700">{rv.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-6 rounded-[var(--radius-card)] bg-sand-100 p-5 sm:p-6">
        <h3 className="font-bold text-ink-900">{r.write}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">{r.name}</span>
            <input
              required
              maxLength={80}
              value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              className={cn("h-11 w-full rounded-xl bg-white px-3.5 text-sm ring-1 outline-none focus:ring-2 focus:ring-forest-600", errors.author_name ? "ring-pomegranate-500" : "ring-sand-200")}
            />
            {errors.author_name && <span className="mt-1 block text-xs font-semibold text-pomegranate-600">{errors.author_name}</span>}
          </label>
          <fieldset>
            <legend className="mb-1.5 text-sm font-bold">{r.rating}</legend>
            <StarRatingInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} label={r.rating} />
            {errors.rating && <span className="mt-1 block text-xs font-semibold text-pomegranate-600">{errors.rating}</span>}
          </fieldset>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-bold">{r.body}</span>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder={r.bodyHint}
            className={cn("min-h-28 w-full rounded-xl bg-white px-3.5 py-3 text-sm ring-1 outline-none focus:ring-2 focus:ring-forest-600", errors.body ? "ring-pomegranate-500" : "ring-sand-200")}
          />
          {errors.body && <span className="mt-1 block text-xs font-semibold text-pomegranate-600">{errors.body}</span>}
        </label>
        {/* Honeypot for bots; hidden from people and screen readers. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={status === "sending" || !form.rating} className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-5 py-2.5 text-sm font-bold text-sand-50 hover:bg-forest-900 disabled:opacity-50">
            {status === "sending" && <LoaderCircle className="size-4 animate-spin" />}
            {r.submit}
          </button>
          {message && <span className={cn("text-sm font-semibold", status === "done" ? "text-forest-700" : "text-pomegranate-600")}>{message}</span>}
        </div>
      </form>
    </section>
  );
}
