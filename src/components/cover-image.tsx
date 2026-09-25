import Image from "next/image";
import { Castle, Droplets, Mountain, MountainSnow, Route, Trees, Waves } from "lucide-react";
import { Topo } from "./topo";
import { cn } from "@/lib/format";
import type { Photo } from "@/lib/types";

const ICONS = {
  waterfall: Droplets,
  lake: Waves,
  peak: MountainSnow,
  village: Mountain,
  historic: Castle,
  park: Trees,
  trail: Route,
} as const;

/** A photo when we have an open-licensed one, otherwise a contour-line placeholder. */
export function CoverImage({
  image,
  kind,
  alt,
  sizes,
  priority,
  className,
}: {
  image: Photo | null;
  kind: keyof typeof ICONS;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (image) {
    return <Image src={image.url} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
  }
  const Icon = ICONS[kind];
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-forest-700 to-forest-950">
      <Topo className="absolute -top-1/4 -right-1/4 h-[150%] w-auto text-forest-600/40" />
      <Icon className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-moss-200/70" strokeWidth={1.5} />
    </div>
  );
}

export function PhotoCredit({ image, prefix, className }: { image: Photo; prefix: string; className?: string }) {
  if (!image.author && !image.license) return null;
  const text = [image.caption, [image.author, image.license].filter(Boolean).join(" · ")].filter(Boolean).join(" — ");
  const body = `${prefix}: ${text}`;
  return image.source ? (
    <a href={image.source} target="_blank" rel="noreferrer" className={cn("rounded-full bg-black/45 px-2.5 py-1 text-[0.65rem] font-medium text-white/90 backdrop-blur hover:bg-black/60", className)}>
      {body}
    </a>
  ) : (
    <span className={cn("rounded-full bg-black/45 px-2.5 py-1 text-[0.65rem] font-medium text-white/90", className)}>{body}</span>
  );
}
