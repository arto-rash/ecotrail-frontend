import Link from "next/link";
import { Topo } from "@/components/topo";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const e = dict.errors;
  return (
    <div className="relative container-page flex min-h-[60vh] flex-col items-center justify-center overflow-hidden py-24 text-center">
      <Topo className="pointer-events-none absolute w-[40rem] text-sand-200" />
      <p className="relative text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">{e.notFoundEyebrow}</p>
      <h1 className="font-display-tight relative mt-3 text-5xl font-semibold text-forest-900">{e.notFoundTitle}</h1>
      <p className="relative mt-3 max-w-md text-ink-700">{e.notFoundText}</p>
      <Link href={localePath(locale, "/trails")} className="relative mt-8 rounded-full bg-forest-800 px-6 py-3 font-bold text-sand-50 hover:bg-forest-900">{e.backToTrails}</Link>
    </div>
  );
}
