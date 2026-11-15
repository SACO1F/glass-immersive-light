import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "refractive-card",
  name: "RefractiveCard",
  displayName: "折射卡片",
  layer: "scene",
  tech: "css",
  fidelity: "medium",
  gpu: "medium",
  priority: "P0",
  summary:
    "用背景模糊、边缘高光、内阴影和指针高光叠出玻璃厚度，并内置 T1/T2/T3 降级。",
  fallbackSummary: "blur-only / opaque surface",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: {
    min: "low",
    default: "auto",
  },
  props: [
    {
      name: "tier",
      type: '"auto" | "high" | "mid" | "low"',
      default: '"auto"',
      description:
        "覆盖设备档位。auto 继承最近的 data-tier 属性或全局 TierProvider。",
    },
    {
      name: "intensity",
      type: "number",
      default: "0.6",
      description: "高光与边缘强度，范围 0–1。",
    },
    {
      name: "blur",
      type: "number",
      default: "14",
      description: "背景模糊像素值；会被设备档位上限截断。",
    },
    {
      name: "tilt",
      type: "boolean",
      default: "true",
      description: "指针倾斜。触摸设备和 reduced-motion 下自动禁用。",
    },
    {
      name: "variant",
      type: '"clear" | "frosted" | "tinted"',
      default: '"frosted"',
      description: "玻璃色调预设。",
    },
    {
      name: "as",
      type: '"div" | "article" | "section"',
      default: '"div"',
      description: "根节点语义标签。",
    },
    {
      name: "className",
      type: "string",
      default: "—",
      description: "透传类名，通常用于控制宽度和布局。",
    },
  ],
  cssVariables: [
    {
      name: "--il-card-radius",
      default: "26px",
      description: "卡片圆角。",
    },
    {
      name: "--il-card-padding",
      default: "24px",
      description: "内容区内边距。",
    },
    {
      name: "--il-card-tint",
      default: "rgb(255 255 255 / 0.08)",
      description: "玻璃色调叠加层。",
    },
    {
      name: "--il-card-surface",
      default: "#0d1218",
      description: "降级与底色使用的表面颜色。",
    },
    {
      name: "--il-card-text",
      default: "#f2f7fb",
      description: "内容文字颜色。",
    },
  ],
  degradation: [
    {
      tier: "high",
      behavior: "完整背景模糊 + 指针高光 + 最大 4° 倾斜。",
    },
    {
      tier: "mid",
      behavior: "模糊上限 10px，保留边缘高光和静态层次。",
    },
    {
      tier: "low",
      behavior: "移除 backdrop-filter，改为不透明表面，禁用倾斜和指针高光。",
    },
    {
      tier: "reduced-motion",
      behavior: "禁用倾斜和过渡，保留静态边缘高光。",
    },
  ],
  a11y: [
    "卡片根节点不裁剪焦点环；交互元素可获得可见的 :focus-visible 轮廓。",
    "触摸设备禁用倾斜与指针高光，内容不依赖 hover 才能读取。",
    "尊重 prefers-reduced-motion 与 prefers-reduced-transparency。",
    "浅色背景下默认 frosted 变体仍使用深色表面；若要改成浅色玻璃，需要同时覆盖 --il-card-surface / --il-card-text 并重新校验对比度。",
  ],
  browserNotes: [
    "Safari 需要 -webkit-backdrop-filter；不支持时自动回退到不透明表面。",
    "祖先元素上的 filter 或 opacity 可能影响 backdrop-filter 采样，避免嵌套玻璃容器。",
  ],
} satisfies ComponentMeta;
