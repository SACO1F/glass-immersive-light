import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "ripple-pool",
  name: "RipplePool",
  displayName: "点击光池涟漪",
  layer: "signature",
  tech: "css",
  fidelity: "medium",
  gpu: "low",
  priority: "P2",
  summary:
    "点击或按下 Enter/Space，在光池表面生成一圈扩散光涟漪；指针靠近时池面环境光会先亮起来。",
  fallbackSummary: "static ring",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    { name: "tier", type: '"auto" | "high" | "mid" | "low"', default: '"auto"', description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。" },
    { name: "intensity", type: "number", default: "0.8", description: "光池环境光与底色强度，范围 0–1。" },
    { name: "color", type: "string", default: "var(--il-accent)", description: "涟漪与池面光色。" },
    { name: "maxRipples", type: "number", default: "6", description: "同时存在的最大涟漪数，范围 1–10。" },
    { name: "label", type: "string", default: '"点击产生光池涟漪"', description: "根节点的 aria-label。" },
  ],
  cssVariables: [
    { name: "--il-ripple-radius", default: "28px", description: "光池圆角。" },
    { name: "--il-ripple-intensity", default: "0.8", description: "光池强度。" },
    { name: "--il-pool-color", default: "var(--il-accent)", description: "涟漪与池面光色。" },
    { name: "--il-pool-surface", default: "#081018", description: "光池底色。" },
  ],
  degradation: [
    { tier: "high", behavior: "完整指针环境光 + 扩散涟漪。" },
    { tier: "mid", behavior: "保留涟漪，环境光按档位降低。" },
    { tier: "low", behavior: "移除环境光，仅保留短时长 CSS 涟漪。" },
    { tier: "reduced-motion", behavior: "不播放扩散动画，显示静态光环。" },
  ],
  a11y: [
    "根节点 role=button、tabIndex=0，Enter/Space 可在中心生成涟漪。",
    "aria-label 可自定义；涟漪是视觉增强，不承载信息。",
    "减少动态模式下显示静态光环，不播放扩散动画。",
  ],
  browserNotes: [
    "涟漪只用 transform / opacity，不触发布局重排。",
    "同时涟漪数量有上限，避免长时间连点累积 DOM。",
  ],
} satisfies ComponentMeta;
