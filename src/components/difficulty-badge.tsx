import { DIFFICULTY, cn } from "@/lib/format";
import type { Difficulty } from "@/lib/types";

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const d = DIFFICULTY[difficulty];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset", d.badge, className)}>
      <span className="size-1.5 rounded-full" style={{ background: d.color }} />
      {d.label}
    </span>
  );
}
