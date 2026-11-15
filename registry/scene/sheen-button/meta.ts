import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "sheen-button",
  name: "SheenButton",
  displayName: "高光按钮",
  layer: "scene",
  tech: "css",
  fidelity: "high",
  gpu: "low",
  priority: "P0",
  summary:
    "高光扫过按钮表面，指针在按钮周围移动时边缘与环境光会先亮起来；指针进入内部后保留原有 hover 扫光。",
  fallbackSummary: "plain hover background",
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
      name: "variant",
      type: '"solid" | "glass"',
      default: '"solid"',
      description: "实心或玻璃按钮外观。",
    },
    {
      name: "size",
      type: '"sm" | "md" | "lg"',
      default: '"md"',
      description: "按钮尺寸。",
    },
    {
      name: "intensity",
      type: "number",
      default: "0.7",
      description: "环境光强度，范围 0–1。",
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
      name: "--il-button-radius",
      default: "999px",
      description: "按钮圆角。",
    },
    {
      name: "--il-button-intensity",
      default: "0.7",
      description: "环境光强度。",
    },
    {
      name: "--il-light-proximity",
      default: "0",
      description: "指针接近度 0–1，由运行时写入。",
    },
  ],
  degradation: [
    { tier: "high", behavior: "完整指针环境光 + 边缘高光 + hover 扫光。" },
    { tier: "mid", behavior: "保留环境光与扫光，强度降低。" },
    { tier: "low", behavior: "移除指针光效和扫光，使用静态边框与背景。" },
    {
      tier: "reduced-motion",
      behavior: "禁用扫光与指针光效，保留静态按钮。",
    },
  ],
  a11y: [
    "原生 button 语义，默认 type=\"button\"，避免误触发表单提交。",
    "保留 :focus-visible、:disabled 和键盘操作。",
    "装饰层 aria-hidden，文本对比度由 variant 与主题变量保证。",
  ],
  browserNotes: [
    "玻璃 variant 依赖 backdrop-filter，Safari 需要 -webkit- 前缀。",
    "扫光与指针光效在 reduced-motion 或 coarse pointer 下自动停用。",
  ],
} satisfies ComponentMeta;
