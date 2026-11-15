import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "blur-refraction",
  name: "BlurRefraction",
  displayName: "模糊折射层",
  layer: "optical",
  tech: "css",
  fidelity: "medium",
  gpu: "medium",
  priority: "P0",
  summary:
    "backdrop-filter 玻璃层叠加指针环境光，是场景组件的基础折射面板；指针在组件外经过时边缘与内部光线仍会响应。",
  fallbackSummary: "blur-only / opaque",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    {
      name: "tier",
      type: '"auto" | "high" | "mid" | "low"',
      default: '"auto"',
      description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。",
    },
    {
      name: "blur",
      type: "number",
      default: "16",
      description: "背景模糊像素值，会被设备档位上限截断。",
    },
    {
      name: "tint",
      type: '"clear" | "frosted" | "tinted"',
      default: '"frosted"',
      description: "玻璃色调预设。",
    },
    {
      name: "radius",
      type: "number",
      default: "26",
      description: "面板圆角，单位 px。",
    },
    {
      name: "as",
      type: '"div" | "article" | "section"',
      default: '"div"',
      description: "根节点语义标签。",
    },
  ],
  cssVariables: [
    { name: "--il-glass-radius", default: "26px", description: "面板圆角。" },
    {
      name: "--il-glass-blur-raw",
      default: "16px",
      description: "原始模糊值，通常由 blur prop 写入。",
    },
    {
      name: "--il-glass-tint",
      default: "rgb(255 255 255 / 0.08)",
      description: "玻璃色调叠加层。",
    },
    {
      name: "--il-glass-padding",
      default: "24px",
      description: "内容区内边距。",
    },
    {
      name: "--il-glass-surface",
      default: "#0d1218",
      description: "降级与底色使用的表面颜色。",
    },
  ],
  degradation: [
    { tier: "high", behavior: "完整背景模糊 + 指针环境光与边缘高光。" },
    { tier: "mid", behavior: "模糊上限 10px，保留边缘高光。" },
    { tier: "low", behavior: "移除 backdrop-filter，使用不透明表面和静态描边。" },
    {
      tier: "reduced-motion",
      behavior: "禁用指针光效，保留静态玻璃层次。",
    },
  ],
  a11y: [
    "装饰层 aria-hidden；内容位于玻璃层之上。",
    "焦点环不被裁剪；内容对比度需要按实际背景校验。",
    "尊重 reduced-transparency 与 reduced-motion。",
  ],
  browserNotes: [
    "Safari 需要 -webkit-backdrop-filter；不支持时自动回退为不透明表面。",
    "避免嵌套多个 backdrop-filter 容器。",
  ],
} satisfies ComponentMeta;
