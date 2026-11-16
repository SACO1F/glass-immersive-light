"use client";

import { useState } from "react";
import { GlassHero } from "./index";

export function GlassHeroDemo() {
  const [dispersion, setDispersion] = useState(0);
  const [backend, setBackend] = useState<"webgl" | "css">("css");

  return (
    <div className="w-full max-w-4xl">
      <GlassHero
        className="w-full"
        refraction={0.6}
        dispersion={dispersion}
        onBackendChange={setBackend}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-text-subtle)]">
            Signature · scene refraction
          </span>
          <span className="rounded-full border border-[var(--il-glass-border)] bg-[var(--il-glass-fill)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--il-text-muted)]">
            {backend === "webgl" ? "WebGL" : "CSS base"}
          </span>
        </div>

        <div className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
            Liquid glass · controlled scene
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-[var(--il-text)] sm:text-4xl">
            光穿过介质
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
            移动指针观察边缘折射。色散开启后，R/G/B 通道会产生轻微偏移；
            T2/T3 下回落为 CSS tint 与 Fresnel 基座。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={dispersion > 0 && backend === "webgl"}
            onClick={() => setDispersion((value) => (value > 0 ? 0 : 0.45))}
            className="rounded-full border border-[var(--il-glass-border)] bg-[var(--il-glass-fill)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--il-text)] transition-colors hover:bg-[var(--il-glass-fill-strong)]"
          >
            {dispersion > 0
              ? backend === "webgl"
                ? "色散已开启"
                : "色散待 WebGL"
              : "开启色散"}
          </button>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--il-text-subtle)]">
            T1 · WebGL 2/1 · dispersion opt-in
          </span>
        </div>
      </GlassHero>

      <p className="mt-4 max-w-3xl font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-[var(--il-text-subtle)]">
        场景由组件自带，不采样页面 DOM；CSS 基座没有真实背景位移或色散。
      </p>
    </div>
  );
}
