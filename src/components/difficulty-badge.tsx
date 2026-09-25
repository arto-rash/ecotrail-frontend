"use client";

import { useI18n } from "./i18n-provider";
import { DIFFICULTY_STYLE, cn } from "@/lib/format";
import type { Difficulty } from "@/lib/types";

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const { dict } = useI18n();
  const style = DIFFICULTY_STYLE[difficulty];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset", style.badge, className)}>
      <span className="size-1.5 rounded-full" style={{ background: style.color }} />
      {dict.difficulty[difficulty]}
    </span>
  );
}
