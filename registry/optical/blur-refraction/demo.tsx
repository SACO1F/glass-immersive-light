"use client";

import { useState } from "react";
import { BlurRefraction } from "./index";

const tints = ["clear", "frosted", "tinted"] as const;
type Tint = (typeof tints)[number];

export function BlurRefractionDemo() {
  const [tint, setTint] = useState<Tint>("frosted");

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div
        role="group"
        aria-label="玻璃变体"
        className="flex items-center gap-1 rounded-full border border-[var(--il-glass-border)] bg-[var(--il-glass-fill)] p-1"
      >
        {tints.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={tint === item}
            onClick={() => setTint(item)}
            className={[
              "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              tint === item
                ? "bg-[var(--il-text)] text-[var(--il-bg)]"
                : "text-[var(--il-text-muted)] hover:text-[var(--il-text)]",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
      </div>

      <BlurRefraction
        className="w-full"
        radius={26}
        blur={16}
        tint={tint}
      >
        <div className="p-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
            BlurRefraction
          </p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[var(--il-text)]">
            先模糊，再谈折射
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
            切换 tint 与预览背景到棋盘格，观察玻璃对背景的模糊；移动鼠标到边缘外侧，光会先于指针进入面板。
          </p>
        </div>
      </BlurRefraction>
    </div>
  );
}
