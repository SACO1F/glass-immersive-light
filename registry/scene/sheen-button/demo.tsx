"use client";

import { useState } from "react";
import { SheenButton } from "./index";

export function SheenButtonDemo() {
  const [intensity, setIntensity] = useState(0.75);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
      <label className="flex w-full items-center gap-3 rounded-full border border-[var(--il-glass-border)] bg-[var(--il-glass-fill)] px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--il-text-muted)]">
          Intensity
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={intensity}
          onChange={(event) => setIntensity(Number(event.target.value))}
          className="h-1 w-full accent-[var(--il-accent)]"
          aria-label="高光强度"
        />
        <span className="w-9 text-right font-mono text-[10px] text-[var(--il-text-subtle)]">
          {intensity.toFixed(2)}
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <SheenButton size="lg" intensity={intensity}>
          光感按钮
        </SheenButton>
        <SheenButton size="lg" variant="glass" intensity={intensity}>
          玻璃按钮
        </SheenButton>
      </div>
    </div>
  );
}
