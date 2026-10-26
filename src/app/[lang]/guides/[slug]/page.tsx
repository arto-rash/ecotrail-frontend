import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BadgeCheck, Info, Languages, MapPinned, Timer } from "lucide-react";
import { ContactReveal } from "@/components/contact-reveal";
import { GuideAvatar } from "@/components/guide-avatar";
import { Rating } from "@/components/rating";
import { Reviews } from "@/components/reviews";
import { ShareButton } from "@/components/share-button";
import { TourCard } from "@/components/tour-card";
import { fill, localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { imageUrl } from "@/lib/api";
import { getGuide, safe } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/[lang]/guides/[slug]">): Promise<Metadata> {
  const guide = await safe(getGuide((await params).slug));
  if (!guide) return {};
  return {
    title: guide.name,
    description: guide.headline ?? undefined,
    openGraph: { images: guide.photo ? [imageUrl(guide.photo)!] : [] },
    alternates: { languages: { az: `/az/guides/${guide.slug}`, en: `/en/guides/${guide.slug}` } },
  };
}

export default async function GuidePage({ params }: PageProps<"/[lang]/guides/[slug]">) {
  const { slug } = await params;
  const [locale, dict, guide] = await Promise.all([getLocale(), getDictionary(), getGuide(slug)]);
  if (!guide) notFound();
  const g = dict.guides;

  const facts = [
    guide.experience_years ? { icon: Timer, label: g.experience, value: guide.experience_years === 1 ? g.yearsOne : fill(g.years, { count: guide.experience_years }) } : null,
    guide.regions.length ? { icon: MapPinned, label: g.worksIn, value: guide.regions.map((r) => r.name).join(", ") } : null,
    guide.languages.length ? { icon: Languages, label: g.languagesLabel, value: guide.languages.map((l) => l.label).join(", ") } : null,
  ].filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <article className="container-page pt-6 pb-10">
      <Link href={localePath(locale, "/guides")} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> {g.allGuides}
      </Link>

      {guide.is_sample && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-ochre-100 px-4 py-3 text-sm font-semibold text-[#7a5410]">
          <Info className="mt-0.5 size-4 shrink-0" /> {g.sampleNote}
        </p>
      )}

      <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <GuideAvatar name={guide.name} photo={guide.photo} className="size-24 sm:size-28" textClassName="text-3xl" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink-500">{guide.kind === "agency" ? g.agency : g.guide}</span>
              {guide.is_sample && <span className="rounded-full bg-ochre-100 px-2 py-0.5 text-xs font-bold text-[#7a5410]">{g.sample}</span>}
              {guide.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2 py-0.5 text-xs font-bold text-forest-700"><BadgeCheck className="size-3.5" /> {g.verified}</span>}
            </div>
            <h1 className="font-display-tight mt-1 text-4xl font-extrabold text-forest-900 sm:text-5xl">{guide.name}</h1>
            {guide.headline && <p className="mt-1 text-lg font-semibold text-forest-800">{guide.headline}</p>}
            <Rating value={guide.rating} count={guide.reviews_count} className="mt-1 text-ink-700" />
          </div>
        </div>
        <ShareButton title={guide.name} />
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-12">
          {guide.bio && (
            <section>
              <h2 className="font-display-tight text-2xl font-extrabold text-forest-900">{g.about}</h2>
              <div className="mt-3 space-y-4 leading-relaxed text-ink-700">
                {guide.bio.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          )}

          {(guide.specialties.length > 0 || guide.certifications.length > 0) && (
            <section className="grid gap-8 sm:grid-cols-2">
              {guide.specialties.length > 0 && (
                <div>
                  <h2 className="font-display-tight text-xl font-extrabold text-forest-900">{g.specialties}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {guide.specialties.map((s) => <span key={s.value} className="rounded-full bg-moss-100 px-3 py-1.5 text-sm font-bold text-forest-800">{s.label}</span>)}
                  </div>
                </div>
              )}
              {guide.certifications.length > 0 && (
                <div>
                  <h2 className="font-display-tight text-xl font-extrabold text-forest-900">{g.certifications}</h2>
                  <ul className="mt-3 space-y-2">
                    {guide.certifications.map((c) => (
                      <li key={c.name} className="flex items-start gap-2 text-sm">
                        <Award className="mt-0.5 size-4 shrink-0 text-ochre-500" />
                        <span><b className="text-ink-900">{c.name}</b>{c.issuer || c.year ? <span className="text-ink-500"> — {[c.issuer, c.year].filter(Boolean).join(", ")}</span> : null}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="font-display-tight text-2xl font-extrabold text-forest-900">{g.tours}</h2>
            {guide.tours.length > 0 ? (
              <div className="mt-4 space-y-4">{guide.tours.map((t) => <TourCard key={t.slug} tour={t} />)}</div>
            ) : (
              <p className="mt-3 text-ink-500">{g.noTours}</p>
            )}
          </section>

          <Reviews kind="guides" slug={guide.slug} initial={guide.reviews} rating={guide.rating} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-sand-200">
            <p className="text-xs font-bold tracking-[0.14em] text-ink-500 uppercase">{g.contactTitle}</p>
            <p className="mt-1 mb-4 text-ink-700">
              {guide.price_from_azn !== null ? (
                <>{g.from} <b className="font-display-tight text-2xl text-ink-900">{guide.price_from_azn} ₼</b> {guide.price_unit?.label}</>
              ) : (
                g.priceOnRequest
              )}
            </p>
            <ContactReveal slug={guide.slug} channels={guide.contact_channels} />
          </div>
          {facts.length > 0 && (
            <dl className="divide-y divide-sand-200 rounded-[var(--radius-card)] bg-white ring-1 ring-sand-200">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-4">
                  <Icon className="mt-0.5 size-4 shrink-0 text-forest-600" />
                  <div>
                    <dt className="text-[0.65rem] font-bold tracking-[0.14em] text-ink-500 uppercase">{label}</dt>
                    <dd className="font-semibold text-ink-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </aside>
      </div>
    </article>
  );
}
