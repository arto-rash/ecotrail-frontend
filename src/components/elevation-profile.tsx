"use client";

import { useId, useMemo, useState } from "react";
import { useI18n } from "./i18n-provider";
import { formatNumber } from "@/lib/format";

const W = 640;
const H = 180;
const PAD = { top: 12, right: 12, bottom: 24, left: 44 };

/** Area chart of [km, metres] samples with a hover readout. */
export function ElevationProfile({ profile }: { profile: [number, number][] }) {
  const { locale, dict } = useI18n();
  const gradient = useId();
  const [hover, setHover] = useState<number | null>(null);

  const geom = useMemo(() => {
    const kms = profile.map((p) => p[0]);
    const eles = profile.map((p) => p[1]);
    const maxKm = Math.max(...kms) || 1;
    const minE = Math.min(...eles);
    const maxE = Math.max(...eles);
    const span = Math.max(50, maxE - minE);
    const lo = Math.floor((minE - span * 0.1) / 50) * 50;
    const hi = Math.ceil((maxE + span * 0.05) / 50) * 50;
    const x = (km: number) => PAD.left + (km / maxKm) * (W - PAD.left - PAD.right);
    const y = (e: number) => PAD.top + (1 - (e - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);
    const line = profile.map(([km, e], i) => `${i ? "L" : "M"}${x(km).toFixed(1)},${y(e).toFixed(1)}`).join("");
    const area = `${line}L${x(maxKm).toFixed(1)},${H - PAD.bottom}L${PAD.left},${H - PAD.bottom}Z`;
    const ticks = [lo, Math.round((lo + hi) / 2 / 50) * 50, hi];
    const kmTicks = [0, maxKm / 2, maxKm];
    return { x, y, line, area, ticks, kmTicks, maxKm };
  }, [profile]);

  if (profile.length < 2) return null;
  const point = hover !== null ? profile[hover] : null;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const km = (((e.clientX - rect.left) / rect.width) * W - PAD.left) / (W - PAD.left - PAD.right) * geom.maxKm;
    let best = 0;
    profile.forEach(([k], i) => {
      if (Math.abs(k - km) < Math.abs(profile[best][0] - km)) best = i;
    });
    setHover(best);
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={dict.trail.profile}>
        <defs>
          <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4a855c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4a855c" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {geom.ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={geom.y(t)} y2={geom.y(t)} stroke="#ebe2d0" />
            <text x={PAD.left - 6} y={geom.y(t) + 4} textAnchor="end" fontSize="11" fill="#8a9086">{formatNumber(locale, t)}</text>
          </g>
        ))}
        {geom.kmTicks.map((k, i) => (
          <text key={i} x={geom.x(k)} y={H - 6} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"} fontSize="11" fill="#8a9086">
            {formatNumber(locale, k, 1)} {dict.common.km}
          </text>
        ))}
        <path d={geom.area} fill={`url(#${gradient})`} />
        <path d={geom.line} fill="none" stroke="#285237" strokeWidth="2" strokeLinejoin="round" />
        {point && (
          <g>
            <line x1={geom.x(point[0])} x2={geom.x(point[0])} y1={PAD.top} y2={H - PAD.bottom} stroke="#1a1d19" strokeDasharray="3 3" />
            <circle cx={geom.x(point[0])} cy={geom.y(point[1])} r="4.5" fill="#b4432a" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {point && (
        <div className="pointer-events-none absolute top-1 right-2 rounded-lg bg-forest-950/85 px-2.5 py-1 text-xs font-bold text-sand-50">
          {formatNumber(locale, point[0], 1)} {dict.common.km} · {formatNumber(locale, point[1])} {dict.common.m}
        </div>
      )}
    </div>
  );
}
