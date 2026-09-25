/** Decorative contour lines, drawn in currentColor. */
export function Topo({ className }: { className?: string }) {
  const rings = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg viewBox="0 0 600 600" fill="none" aria-hidden="true" className={className}>
      {rings.map((i) => {
        const s = 1 + i * 0.16;
        return (
          <path
            key={i}
            d="M300 95c62 4 118 30 150 78s44 92 30 150-54 104-112 124-121 16-170-14-84-78-92-136 12-112 52-151 80-55 142-51Z"
            transform={`translate(${300 - 300 * s} ${300 - 300 * s}) scale(${s}) rotate(${i * 7} 300 300)`}
            stroke="currentColor"
            strokeWidth={1.4 / s}
          />
        );
      })}
    </svg>
  );
}
