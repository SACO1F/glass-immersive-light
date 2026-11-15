import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "inner-shade",
  name: "InnerShade",
  displayName: "内阴影",
  layer: "optical",
  tech: "css",
  fidelity: "high",
  gpu: "low",
  priority: "P0",
  summary:
    "用内阴影和环境遮蔽塑造容器厚度；指针在组件外靠近时，内部暗部与柔光会随光源方向变化。",
  fallbackSummary: "single inset shadow",
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
      name: "depth",
      type: "number",
      default: "0.7",
      description: "内阴影深度，范围 0–1。",
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
      description: "透传类名。",
    },
  ],
  cssVariables: [
    {
      name: "--il-inner-radius",
      default: "24px",
      description: "容器圆角。",
    },
    {
      name: "--il-inner-depth",
      default: "0.7",
      description: "内阴影深度。",
    },
    {
      name: "--il-inner-padding",
      default: "24px",
      description: "内容区内边距。",
    },
    {
      name: "--il-inner-surface",
      default: "#0d1218",
      description: "容器表面颜色。",
    },
  ],
  degradation: [
    { tier: "high", behavior: "完整环境遮蔽 + 指针内部柔光。" },
    { tier: "mid", behavior: "保留内阴影，降低指针柔光强度。" },
    { tier: "low", behavior: "移除指针光效，使用静态内阴影。" },
    {
      tier: "reduced-motion",
      behavior: "禁用光源跟随，保留静态内阴影。",
    },
  ],
  a11y: [
    "装饰层 aria-hidden，不承载信息。",
    "内容位于遮罩之上，焦点环不被裁剪。",
    "减少动态模式下保持静态内阴影。",
  ],
  browserNotes: [
    "使用现代 CSS 颜色语法；旧浏览器会退化为静态内阴影。",
  ],
} satisfies ComponentMeta;
