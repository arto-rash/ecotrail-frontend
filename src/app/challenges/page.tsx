import type { Metadata } from "next";
import Link from "next/link";
import { Bike, Camera, Droplets, Flame, Footprints, Leaf, MapPinPlus, Recycle, ShoppingBasket, Sprout } from "lucide-react";
import { Topo } from "@/components/topo";

export const metadata: Metadata = {
  title: "Eco-challenges",
  description: "Simple challenges that keep Azerbaijan's trails clean, wild and welcoming.",
};

const CHALLENGES = [
  { icon: Recycle, title: "Pack out one extra", points: 20, level: "Everyday", text: "On every hike, carry out at least one piece of litter that isn't yours." },
  { icon: Droplets, title: "Zero plastic bottles", points: 30, level: "Everyday", text: "Complete three hikes using only a refillable bottle and mountain springs." },
  { icon: Footprints, title: "Stay on the path", points: 10, level: "Everyday", text: "No shortcuts across switchbacks or meadows for a whole season." },
  { icon: ShoppingBasket, title: "Village-to-table", points: 25, level: "Weekend", text: "Buy lunch or supplies from a family in the village where your hike starts." },
  { icon: Bike, title: "Low-carbon trailhead", points: 40, level: "Weekend", text: "Reach a trailhead by shared taxi, bus or train instead of a private car." },
  { icon: Flame, title: "No-trace camp", points: 35, level: "Adventure", text: "Camp overnight without an open fire and leave the pitch exactly as you found it." },
  { icon: Camera, title: "Trail reporter", points: 25, level: "Community", text: "Report a damaged sign, blocked path or illegal dumping with a photo and location." },
  { icon: MapPinPlus, title: "Map a new trail", points: 50, level: "Community", text: "Share a trail that isn't on EcoTrail yet — with photos and waypoints." },
  { icon: Sprout, title: "Clean-up day", points: 60, level: "Community", text: "Join or organise a group litter pick on a popular trail." },
];

const PRINCIPLES = [
  "Plan ahead and prepare",
  "Travel and camp on durable surfaces",
  "Dispose of waste properly",
  "Leave what you find",
  "Minimise campfire impacts",
  "Respect wildlife",
  "Be considerate of other visitors",
];

export default function ChallengesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-forest-900 text-sand-50">
        <Topo className="pointer-events-none absolute -top-40 -right-40 w-[48rem] text-forest-800" />
        <div className="container-page relative py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-moss-200 uppercase"><Leaf className="size-4" /> Eco-challenges</p>
          <h1 className="font-display-tight mt-3 max-w-3xl text-5xl leading-[1] font-semibold sm:text-6xl">
            Hike it. Love it. <span className="italic font-normal text-moss-200">Leave it wild.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-sand-200/90">
            Small, doable challenges that protect the places we love. Take them on alone or with friends — progress tracking and badges arrive with EcoTrail accounts.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHALLENGES.map(({ icon: Icon, title, points, level, text }) => (
            <article key={title} className="group relative flex flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-sand-200">
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-moss-100 text-forest-800 transition group-hover:bg-forest-800 group-hover:text-sand-50">
                  <Icon className="size-6" />
                </span>
                <span className="rounded-full bg-ochre-100 px-2.5 py-1 text-xs font-bold text-[#7a5410]">+{points} pts</span>
              </div>
              <p className="mt-5 text-[0.65rem] font-bold tracking-[0.16em] text-ink-500 uppercase">{level}</p>
              <h2 className="font-display-tight mt-1 text-xl font-semibold text-forest-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="grid gap-10 rounded-[2rem] bg-moss-100 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display-tight text-3xl font-semibold text-forest-900 sm:text-4xl">The seven principles of Leave No Trace</h2>
            <p className="mt-4 text-ink-700">
              An internationally used framework for enjoying the outdoors responsibly. Every EcoTrail challenge builds on one of these.
            </p>
            <Link href="/trails" className="mt-8 inline-flex rounded-full bg-forest-800 px-5 py-3 text-sm font-bold text-sand-50 hover:bg-forest-900">
              Find a trail to start
            </Link>
          </div>
          <ol className="space-y-2">
            {PRINCIPLES.map((p, i) => (
              <li key={p} className="flex items-center gap-4 rounded-2xl bg-sand-50 px-4 py-3 font-semibold text-ink-900">
                <span className="font-display-tight grid size-9 shrink-0 place-items-center rounded-full bg-forest-800 text-sand-50">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
