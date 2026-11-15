import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "liquid-light-pool",
  name: "LiquidLightPool",
  displayName: "可拖拽液态光池",
  layer: "signature",
  tech: "webgl",
  fidelity: "high",
  gpu: "high",
  priority: "P2",
  summary:
    "T1 设备才初始化 WebGL metaball 光池，指针拖拽会吸引液态光团；T2/T3 自动降级为 CSS 光斑，不阻塞页面。",
  fallbackSummary: "CSS blobs",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    { name: "tier", type: '"auto" | "high" | "mid" | "low"', default: '"auto"', description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。" },
    { name: "colorA", type: "string", default: '"#6fe7ff"', description: "主光色。" },
    { name: "colorB", type: "string", default: '"#ff6f9c"', description: "次光色。" },
    { name: "blobCount", type: "number", default: "5", description: "光团数量，范围 3–6。" },
    { name: "intensity", type: "number", default: "0.9", description: "整体亮度，范围 0–1。" },
    { name: "interactive", type: "boolean", default: "true", description: "是否允许指针拖拽光池。" },
  ],
  cssVariables: [
    { name: "--il-pool-radius", default: "28px", description: "光池圆角。" },
    { name: "--il-pool-a", default: "#6fe7ff", description: "主光色。" },
    { name: "--il-pool-b", default: "#ff6f9c", description: "次光色。" },
    { name: "--il-pool-surface", default: "#081018", description: "光池底色。" },
    { name: "--il-pool-pointer-x", default: "0", description: "CSS 回退的横向指针偏移。" },
  ],
  degradation: [
    { tier: "high", behavior: "WebGL metaball 光池 + 指针拖拽；双色混合与边缘亮度为发光近似，不做背景采样。" },
    { tier: "mid", behavior: "CSS 光斑回退，保留指针视差，不初始化 WebGL。" },
    { tier: "low", behavior: "CSS 静态光斑，无动画、无 WebGL。" },
    { tier: "reduced-motion", behavior: "不初始化 WebGL，使用静态 CSS 光斑；能力档位不变。" },
  ],
  a11y: [
    "canvas 为 aria-hidden，组件只做视觉增强。",
    "内容覆盖层不参与指针交互，避免遮挡点击。",
    "减少动态模式下完全不初始化 WebGL。",
  ],
  browserNotes: [
    "T1 才挂载 WebGL；上下文创建失败、着色器失败或 context lost 时自动切 CSS。",
    "DPR 上限 1.5，离屏与页面隐藏时暂停绘制。",
    "WebGL 无法采样任意 DOM 背景，光池是可控底色上的发光近似。",
  ],
} satisfies ComponentMeta;
