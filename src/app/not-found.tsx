import Link from "next/link";
import { Topo } from "@/components/topo";

export default function NotFound() {
  return (
    <div className="relative container-page flex min-h-[60vh] flex-col items-center justify-center overflow-hidden py-24 text-center">
      <Topo className="pointer-events-none absolute w-[40rem] text-sand-200" />
      <p className="relative text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">404 · Off trail</p>
      <h1 className="relative font-display-tight mt-3 text-5xl font-semibold text-forest-900">Looks like you&apos;re lost</h1>
      <p className="relative mt-3 max-w-md text-ink-700">That path doesn&apos;t exist — or it hasn&apos;t been mapped yet.</p>
      <Link href="/trails" className="relative mt-8 rounded-full bg-forest-800 px-6 py-3 font-bold text-sand-50 hover:bg-forest-900">
        Back to the trails
      </Link>
    </div>
  );
}
