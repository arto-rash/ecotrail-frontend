"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

export type DropdownOption = { value: string; label: string; dot?: string };

type Props = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  /** Accessible name; also shown above the value when `eyebrow` is set. */
  label: string;
  /** Show the label as a small caption above the value (hero search style). */
  eyebrow?: boolean;
  className?: string;
  /** Classes for the trigger when a non-empty value is selected (e.g. filled chip). */
  activeClassName?: string;
};

/**
 * The site's own select: a button that opens a styled listbox. Keyboard: arrows, Home/End,
 * Enter/Space to pick, Esc to close, letters jump to the next matching option. The list is
 * portalled to <body> with position:fixed, so overflow:hidden or isolated ancestors can't clip or
 * bury it under other fixed UI (like the mobile tab bar).
 */
export function Dropdown({ value, options, onChange, label, eyebrow, className, activeClassName }: Props) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; minWidth: number; maxHeight: number } | null>(null);
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  const place = useCallback(() => {
    const r = trigger.current?.getBoundingClientRect();
    if (!r) return;
    // Leave room for the fixed mobile tab bar at the bottom of small screens.
    const bottomInset = window.matchMedia("(max-width: 767px)").matches ? 80 : 0;
    const below = window.innerHeight - bottomInset - r.bottom - 12;
    const above = r.top - 12;
    const up = below < 220 && above > below;
    const left = Math.min(r.left, window.innerWidth - Math.max(r.width, 224) - 8);
    setPos({
      left: Math.max(8, left),
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      minWidth: Math.max(r.width, 224),
      maxHeight: Math.min(320, up ? above : below),
    });
  }, []);

  function openList(index = selectedIndex) {
    setActive(index);
    place();
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  }

  // Close on outside click; follow the trigger on scroll and resize.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!trigger.current?.contains(e.target as Node) && !list.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Keep the highlighted option visible.
  useLayoutEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    const last = options.length - 1;
    const moves: Record<string, number> = { ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last };
    if (e.key in moves) {
      e.preventDefault();
      setActive(moves[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const key = e.key.toLocaleLowerCase();
      const order = [...options.slice(active + 1), ...options.slice(0, active + 1)];
      const hit = order.find((o) => o.label.toLocaleLowerCase().startsWith(key));
      if (hit) setActive(options.indexOf(hit));
    }
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={eyebrow ? undefined : label}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          "group inline-flex items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-forest-600",
          className,
          value && activeClassName,
        )}
      >
        <span className="min-w-0 flex-1">
          {eyebrow && <span className="block text-[0.65rem] font-bold tracking-[0.16em] text-ink-500 uppercase">{label}</span>}
          <span className="flex items-center gap-1.5 truncate">
            {selected?.dot && <span className="size-2 shrink-0 rounded-full" style={{ background: selected.dot }} />}
            <span className="truncate">{selected?.label}</span>
          </span>
        </span>
        <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />
      </button>

      {open && pos && createPortal(
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          style={{ position: "fixed", left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.minWidth, maxHeight: pos.maxHeight }}
          className="z-[60] overflow-y-auto overscroll-contain rounded-2xl bg-white p-1.5 text-sm text-ink-900 shadow-[var(--shadow-lift)] ring-1 ring-sand-200"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${id}-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setActive(i)}
                onClick={() => choose(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 font-semibold",
                  i === active && "bg-sand-100",
                  isSelected && "text-forest-800",
                )}
              >
                {o.dot && <span className="size-2.5 shrink-0 rounded-full" style={{ background: o.dot }} />}
                <span className="flex-1 whitespace-nowrap">{o.label}</span>
                <Check className={cn("size-4 shrink-0 text-forest-700", !isSelected && "invisible")} />
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </>
  );
}
