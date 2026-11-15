"use client";

import { useState } from "react";
import { RefractiveCard } from "./index";

const variants = ["clear", "frosted", "tinted"] as const;
type Variant = (typeof variants)[number];

export function RefractiveCardDemo() {
  const [variant, setVariant] = useState<Variant>("frosted");

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div
        role="group"
        aria-label="卡片变体"
        className="flex items-center gap-1 rounded-full border border-[var(--il-glass-border)] bg-[var(--il-glass-fill)] p-1"
      >
        {variants.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={variant === item}
            onClick={() => setVariant(item)}
            className={[
              "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              variant === item
                ? "bg-[var(--il-text)] text-[var(--il-bg)]"
                : "text-[var(--il-text-muted)] hover:text-[var(--il-text)]",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
      </div>

      <RefractiveCard
        variant={variant}
        className="w-full"
        intensity={0.7}
      >
        <div className="p-2 sm:p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
            Refractive Card
          </p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[var(--il-text)]">
            光感不是一层模糊
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
            边缘高光、内阴影、环境色和指针高光共同构成厚度。切换变体观察 tint
            的变化。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-[var(--il-glass-fill)] px-4 py-2 text-sm text-[var(--il-text)] ring-1 ring-[var(--il-glass-border)] transition-colors hover:bg-[var(--il-glass-fill-strong)]"
            >
              键盘聚焦我
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--il-text-subtle)]">
              CSS · T1/T2/T3
            </span>
          </div>
        </div>
      </RefractiveCard>
    </div>
  );
}
