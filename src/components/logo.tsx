import Link from "next/link";
import { cn } from "@/lib/format";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="16" fill="currentColor" />
      <circle cx="21.5" cy="11" r="3" fill="#cc5a3c" />
      <path d="M4.5 23.5 12 13l4.2 5.6L19 15l8.5 8.5" fill="none" stroke="#fbf8f2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href, className, light = false, tagline }: { href: string; className?: string; light?: boolean; tagline: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="EcoTrail">
      <LogoMark className={cn("size-8 transition-transform group-hover:-rotate-6", light ? "text-forest-700" : "text-forest-800")} />
      <span className="leading-none">
        <span className={cn("block font-display-tight text-[1.35rem] font-extrabold", light ? "text-sand-50" : "text-forest-900")}>
          EcoTrail
        </span>
        <span className={cn("block text-[0.6rem] font-bold tracking-[0.22em] uppercase", light ? "text-sand-200/80" : "text-ink-500")}>
          {tagline}
        </span>
      </span>
    </Link>
  );
}
