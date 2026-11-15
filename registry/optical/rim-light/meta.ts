import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "rim-light",
  name: "RimLight",
  displayName: "边缘高光",
  layer: "optical",
  tech: "css",
  fidelity: "high",
  gpu: "low",
  priority: "P0",
  summary:
    "用 1px 渐变描边和指针环境光勾勒容器边缘；鼠标在组件外经过时，高光也会沿最近的边缘移动。",
  fallbackSummary: "static 1px border",
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
      name: "intensity",
      type: "number",
      default: "0.7",
      description: "边缘高光与环境光强度，范围 0–1。",
    },
    {
      name: "radius",
      type: "number",
      default: "24",
      description: "容器圆角，单位 px。",
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
      description: "透传类名；用于布局和内容样式。",
    },
  ],
  cssVariables: [
    {
      name: "--il-rim-radius",
      default: "24px",
      description: "容器圆角。",
    },
    {
      name: "--il-rim-intensity",
      default: "0.7",
      description: "边缘高光与环境光强度。",
    },
    {
      name: "--il-light-x",
      default: "50%",
      description: "光源横向位置，由指针运行时写入。",
    },
    {
      name: "--il-light-y",
      default: "0%",
      description: "光源纵向位置，由指针运行时写入。",
    },
    {
      name: "--il-light-proximity",
      default: "0",
      description: "指针接近度 0–1，由运行时写入。",
    },
  ],
  degradation: [
    {
      tier: "high",
      behavior: "完整指针边缘高光 + 环境光。",
    },
    {
      tier: "mid",
      behavior: "保留边缘高光，环境光强度降低。",
    },
    {
      tier: "low",
      behavior: "移除指针光效，使用静态 1px 渐变描边。",
    },
    {
      tier: "reduced-motion",
      behavior: "不启用指针跟随，保留静态边缘高光。",
    },
  ],
  a11y: [
    "装饰层均为 aria-hidden，不进入无障碍树。",
    "根节点不裁剪焦点环，内容区可获得可见的 :focus-visible 轮廓。",
    "指针光效不是信息载体；触摸设备与减少动态模式下仍保留静态边缘。",
  ],
  browserNotes: [
    "渐变描边使用 mask-composite，Safari 需要 -webkit-mask-composite: xor。",
    "指针光效在 reduced-motion 或 coarse pointer 下自动停用。",
  ],
} satisfies ComponentMeta;
