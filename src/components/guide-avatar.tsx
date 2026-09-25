import Image from "next/image";
import { Monogram } from "./monogram";
import { imageUrl } from "@/lib/api";
import { cn } from "@/lib/format";

/** The guide's photo, or their initials when there isn't one. */
export function GuideAvatar({ name, photo, className = "size-16", textClassName = "text-xl" }: { name: string; photo: string | null; className?: string; textClassName?: string }) {
  const src = imageUrl(photo);
  if (!src) return <Monogram name={name} className={cn(className, textClassName)} />;
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full bg-sand-200", className)}>
      <Image src={src} alt={name} fill sizes="128px" className="object-cover" />
    </span>
  );
}
