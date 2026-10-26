import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  cta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">{eyebrow}</p>}
        <h2 className="font-display-tight text-3xl font-extrabold text-forest-900 sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-ink-700">{description}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-forest-700 hover:text-forest-900">
          {cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
