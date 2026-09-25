import { Star } from "lucide-react";
import { cn } from "@/lib/format";

export function Rating({ value, count, className }: { value?: number | null; count?: number; className?: string }) {
  if (!value) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-bold", className)}>
      <Star className="size-4 fill-ochre-500 text-ochre-500" />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-medium opacity-60">({count})</span>}
    </span>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-3.5", i <= value ? "fill-ochre-500 text-ochre-500" : "text-sand-300")} />
      ))}
    </span>
  );
}
