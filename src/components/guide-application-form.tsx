"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/format";
import type { Region } from "@/lib/types";

const EMPTY = { name: "", kind: "guide", email: "", phone: "", website: "", regions: [] as string[], languages: "", message: "", company: "" };

export function GuideApplicationForm({ regions }: { regions: Region[] }) {
  const { locale, dict } = useI18n();
  const g = dict.guides;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    try {
      await api(`guide-applications?lang=${locale}`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          phone: form.phone || null,
          website: form.website || null,
          languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
        }),
      });
      setStatus("done");
      setForm(EMPTY);
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { errors?: Record<string, string[]> };
        setErrors(Object.fromEntries(Object.entries(body.errors ?? {}).map(([k, v]) => [k.split(".")[0], v[0]])));
      }
    }
  }

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 rounded-[var(--radius-card)] bg-moss-100 p-6 font-semibold text-forest-800">
        <Check className="size-5" /> {g.thanks}
      </p>
    );
  }

  const input = (key: string) => cn("h-11 w-full rounded-xl bg-white px-3.5 text-sm ring-1 outline-none focus:ring-2 focus:ring-forest-600", errors[key] ? "ring-pomegranate-500" : "ring-sand-200");
  const err = (key: string) => errors[key] && <span className="mt-1 block text-xs font-semibold text-pomegranate-600">{errors[key]}</span>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-bold">{g.kind}</legend>
        <div className="inline-flex rounded-full bg-sand-100 p-1">
          {(["guide", "agency"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={form.kind === k} onClick={() => setForm({ ...form, kind: k })} className={cn("rounded-full px-4 py-2 text-sm font-bold transition", form.kind === k ? "bg-white text-forest-900 shadow-sm" : "text-ink-500")}>
              {k === "guide" ? g.kindGuide : g.kindAgency}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="mb-1.5 block text-sm font-bold">{g.name}</span><input required className={input("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{err("name")}</label>
        <label className="block"><span className="mb-1.5 block text-sm font-bold">{g.email}</span><input required type="email" className={input("email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{err("email")}</label>
        <label className="block"><span className="mb-1.5 block text-sm font-bold">{g.phone}</span><input type="tel" className={input("phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />{err("phone")}</label>
        <label className="block"><span className="mb-1.5 block text-sm font-bold">{g.website}</span><input type="url" placeholder="https://" className={input("website")} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />{err("website")}</label>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">{g.regions}</legend>
        <div className="flex flex-wrap gap-2">
          {regions.filter((r) => r.hiking_advised).map((r) => {
            const on = form.regions.includes(r.slug);
            return (
              <button key={r.slug} type="button" aria-pressed={on} onClick={() => setForm({ ...form, regions: on ? form.regions.filter((x) => x !== r.slug) : [...form.regions, r.slug] })}
                className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition", on ? "bg-moss-100 text-forest-800 ring-forest-600" : "bg-white text-ink-700 ring-sand-200 hover:ring-sand-400")}>
                {on && <Check className="size-3.5" />}{r.name}
              </button>
            );
          })}
        </div>
        {err("regions")}
      </fieldset>
      <label className="block"><span className="mb-1.5 block text-sm font-bold">{g.languages}</span><input className={input("languages")} placeholder={g.languagesPlaceholder} value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />{err("languages")}</label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{g.message}</span>
        <textarea required minLength={20} className={cn(input("message"), "h-auto min-h-32 py-3")} placeholder={g.messageHint} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {err("message")}
      </label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === "sending"} className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-sand-50 hover:bg-forest-900 disabled:opacity-60">
          {status === "sending" && <LoaderCircle className="size-4 animate-spin" />} {g.submit}
        </button>
        {status === "error" && !Object.keys(errors).length && <span className="text-sm font-semibold text-pomegranate-600">{g.error}</span>}
      </div>
    </form>
  );
}
