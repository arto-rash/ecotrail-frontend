"use client";

import { useRef, useState } from "react";
import { Star, X } from "lucide-react";
import { useI18n } from "./i18n-provider";
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

/** One star filled to `fill` (0–1): an outline with a clipped solid star on top. */
function PartialStar({ fill, className }: { fill: number; className?: string }) {
  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      <Star className="absolute inset-0 size-full text-sand-400" strokeWidth={1.75} />
      {fill > 0 && (
        <Star
          className="absolute inset-0 size-full fill-ochre-500 text-ochre-500"
          strokeWidth={1.75}
          style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
        />
      )}
    </span>
  );
}

/** Read-only row of five stars; supports half values. */
export function Stars({ value, className, starClassName = "size-3.5" }: { value: number; className?: string; starClassName?: string }) {
  const { dict } = useI18n();
  return (
    <span className={cn("inline-flex gap-px", className)} role="img" aria-label={`${value} ${dict.common.outOf5}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <PartialStar key={i} fill={Math.max(0, Math.min(1, value - i))} className={starClassName} />
      ))}
    </span>
  );
}

/**
 * Letterboxd-style input: hovering previews every star up to the pointer, the left half
 * of a star is a half step, clicking the current value clears it, arrow keys step by 0.5.
 */
export function StarRatingInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const { dict } = useI18n();
  const [hover, setHover] = useState<number | null>(null);
  const row = useRef<HTMLDivElement>(null);
  const shown = hover ?? value;

  function valueAt(clientX: number) {
    const rect = row.current!.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.max(0.5, Math.ceil(ratio * 10) / 2);
  }

  return (
    <div className="flex items-center gap-3">
      <div
        ref={row}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0.5}
        aria-valuemax={5}
        aria-valuenow={value || undefined}
        aria-valuetext={value ? `${value} ${dict.common.outOf5}` : undefined}
        className="flex cursor-pointer touch-none gap-0.5 rounded-lg py-1 outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
        onPointerMove={(e) => setHover(valueAt(e.clientX))}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => {
          const v = valueAt(e.clientX);
          onChange(v === value ? 0 : v);
          // Touch has no hover, so drop the preview once the finger lifts.
          if (e.pointerType !== "mouse") setHover(null);
        }}
        onKeyDown={(e) => {
          const step = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5 }[e.key];
          if (step) {
            e.preventDefault();
            onChange(Math.min(5, Math.max(0.5, (value || 0) + step)));
          } else if (e.key === "Home") onChange(0.5);
          else if (e.key === "End") onChange(5);
          else if (e.key === "Delete" || e.key === "Backspace") onChange(0);
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <PartialStar key={i} fill={Math.max(0, Math.min(1, shown - i))} className={cn("size-8 transition-transform", hover !== null && "scale-[1.04]")} />
        ))}
      </div>
      <span className="w-8 text-sm font-bold text-ink-700 tabular-nums">{shown ? shown.toFixed(1) : ""}</span>
      {value > 0 && (
        <button type="button" onClick={() => onChange(0)} aria-label={dict.common.clearRating} className="grid size-7 place-items-center rounded-full text-ink-400 hover:bg-sand-200 hover:text-ink-700">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
