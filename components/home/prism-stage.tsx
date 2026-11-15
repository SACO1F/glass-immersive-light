"use client";

import { useId, useRef } from "react";

const spectrum = [
  { color: "#ff6f9c", y: 176 },
  { color: "#ffb27a", y: 194 },
  { color: "#ffe38a", y: 212 },
  { color: "#9ff0c8", y: 230 },
  { color: "#6fe7ff", y: 248 },
  { color: "#8b7bff", y: 266 },
];

export function PrismStage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    element.style.setProperty("--px", `${Math.min(96, Math.max(4, x))}%`);
    element.style.setProperty("--py", `${Math.min(94, Math.max(6, y))}%`);
  };

  const handleLeave = () => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--px", "50%");
    element.style.setProperty("--py", "42%");
  };

  return (
    <div
      ref={ref}
      className="prism-stage"
      onPointerMove={handlePointer}
      onPointerLeave={handleLeave}
    >
      <div className="prism-stage__grid" />
      <div className="prism-stage__ring prism-stage__ring--a" />
      <div className="prism-stage__ring prism-stage__ring--b" />

      <svg
        className="prism-stage__svg"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-prism`} x1="140" y1="120" x2="250" y2="286">
            <stop stopColor="var(--site-text)" stopOpacity="0.16" />
            <stop offset="0.55" stopColor="var(--site-accent)" stopOpacity="0.1" />
            <stop offset="1" stopColor="var(--site-accent-2)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        <path
          className="prism-stage__beam"
          d="M 8 198 L 158 198"
          pathLength={220}
        />

        <path
          d="M 196 112 L 268 268 L 124 268 Z"
          stroke="var(--site-line-strong)"
          strokeWidth="1.2"
          fill={`url(#${id}-prism)`}
        />
        <path
          d="M 196 112 L 196 268"
          stroke="var(--site-line)"
          strokeDasharray="3 6"
        />
        <path
          d="M 124 268 L 268 268"
          stroke="var(--site-line)"
          strokeDasharray="3 6"
        />

        <circle cx="196" cy="212" r="3" fill="var(--site-accent)" opacity="0.9" />
        <circle cx="196" cy="212" r="14" stroke="var(--site-accent)" opacity="0.22" />
        <circle cx="196" cy="212" r="30" stroke="var(--site-accent)" opacity="0.1" />

        {spectrum.map((line, index) => (
          <path
            key={line.color}
            className="prism-stage__spectrum"
            d={`M 236 236 L ${370 - index * 7} ${line.y}`}
            stroke={line.color}
            opacity={0.32 + index * 0.09}
          />
        ))}

        <g opacity="0.55">
          <path d="M 28 74 L 88 74" stroke="var(--site-line-strong)" />
          <path d="M 28 74 L 28 112" stroke="var(--site-line-strong)" />
          <path d="M 372 306 L 320 306" stroke="var(--site-line-strong)" />
          <path d="M 372 306 L 372 268" stroke="var(--site-line-strong)" />
        </g>
      </svg>

      <span className="prism-stage__core" />
      <span className="prism-stage__lens" />

      <span className="prism-stage__chip prism-stage__chip--a">caustic field</span>
      <span className="prism-stage__chip prism-stage__chip--b">bevel 01</span>
      <span className="prism-stage__chip prism-stage__chip--c">λ 520 nm</span>

      <div className="prism-stage__caption">
        <span>Interactive study · 001</span>
        <span>move pointer to bend light</span>
      </div>
    </div>
  );
}
