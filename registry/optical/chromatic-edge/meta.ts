import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "chromatic-edge",
  name: "ChromaticEdge",
  displayName: "色散边缘",
  layer: "optical",
  tech: "svg",
  fidelity: "high",
  gpu: "medium",
  priority: "P1",
  summary:
    "用 SVG feTurbulence + feDisplacementMap 扰动一圈彩虹渐变描边，指针靠近时才显现，形成轻微的色散边缘。",
  fallbackSummary: "static border / none",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    { name: "tier", type: '"auto" | "high" | "mid" | "low"', default: '"auto"', description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。" },
    { name: "intensity", type: "number", default: "0.85", description: "边缘显现强度，范围 0–1。" },
    { name: "radius", type: "number", default: "26", description: "容器与描边圆角，单位 px。" },
    { name: "as", type: '"div" | "article" | "section"', default: '"div"', description: "根节点语义标签。" },
  ],
  cssVariables: [
    { name: "--il-chromatic-radius", default: "26px", description: "容器圆角。" },
    { name: "--il-chromatic-padding", default: "28px", description: "内容区内边距。" },
    { name: "--il-chromatic-surface", default: "#0d1218", description: "容器表面颜色。" },
    { name: "--il-chromatic-intensity", default: "0.85", description: "边缘显现强度。" },
  ],
  degradation: [
    { tier: "high", behavior: "完整 SVG 扰动色散边缘 + 指针环境光。" },
    { tier: "mid", behavior: "保留 SVG 边缘，降低环境光强度。" },
    { tier: "low", behavior: "移除 SVG 与指针光效，保留静态表面。" },
    { tier: "reduced-motion", behavior: "不启用指针显现，保留静态表面。" },
  ],
  a11y: [
    "SVG 装饰层 aria-hidden，不进入无障碍树。",
    "内容位于 SVG 之上，焦点环不被裁剪。",
    "高对比模式下强制显示描边，保证边界可辨。",
  ],
  browserNotes: [
    "SVG filter 影响面积越大越耗性能；描边区域很小，适合桌面与中端设备。",
    "Turbulence 只生成一次，指针只改变 opacity，不逐帧重算。",
  ],
} satisfies ComponentMeta;
