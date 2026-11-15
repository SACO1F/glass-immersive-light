import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "ambient-light",
  name: "AmbientLight",
  displayName: "环境光",
  layer: "optical",
  tech: "css",
  fidelity: "high",
  gpu: "low",
  priority: "P1",
  summary:
    "把鼠标指针变成环境光源：在组件周围移动时，柔光会先进入表面，靠近后逐渐变亮。",
  fallbackSummary: "static surface",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    { name: "tier", type: '"auto" | "high" | "mid" | "low"', default: '"auto"', description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。" },
    { name: "intensity", type: "number", default: "0.7", description: "环境光强度，范围 0–1。" },
    { name: "radius", type: "number", default: "26", description: "容器圆角，单位 px。" },
    { name: "as", type: '"div" | "article" | "section"', default: '"div"', description: "根节点语义标签。" },
    { name: "className", type: "string", default: "—", description: "透传类名。" },
  ],
  cssVariables: [
    { name: "--il-ambient-radius", default: "26px", description: "容器圆角。" },
    { name: "--il-ambient-padding", default: "28px", description: "内容区内边距。" },
    { name: "--il-ambient-surface", default: "#0d1218", description: "容器表面颜色。" },
    { name: "--il-ambient-intensity", default: "0.7", description: "环境光强度。" },
  ],
  degradation: [
    { tier: "high", behavior: "完整指针环境光。" },
    { tier: "mid", behavior: "保留环境光，强度按档位缩放。" },
    { tier: "low", behavior: "移除指针环境光，保留静态表面。" },
    { tier: "reduced-motion", behavior: "不启用指针跟随。" },
  ],
  a11y: [
    "环境光层 aria-hidden，不承载信息。",
    "内容位于光层之上，焦点环不被裁剪。",
    "低档位与减少动态模式下保持静态表面。",
  ],
  browserNotes: [
    "深色模式使用 screen 混合，浅色模式切换为 normal，避免白底上不可见。",
  ],
} satisfies ComponentMeta;
