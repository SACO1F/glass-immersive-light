import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "fluid-glass-dock",
  name: "FluidGlassDock",
  displayName: "流体玻璃 Dock",
  layer: "scene",
  tech: "css",
  fidelity: "medium",
  gpu: "medium",
  priority: "P0",
  summary:
    "玻璃 Dock，带相邻图标缩放和指针环境光；指针在 Dock 周围移动时，边缘高光与环境光会先于指针进入。",
  fallbackSummary: "blur + scale, no pointer light",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    {
      name: "items",
      type: "FluidGlassDockItem[]",
      default: "—",
      description: "Dock 项，包含 id、label 与可选 href。",
    },
    {
      name: "tier",
      type: '"auto" | "high" | "mid" | "low"',
      default: '"auto"',
      description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。",
    },
    {
      name: "activeId",
      type: "string",
      default: "—",
      description: "受控激活项 id。",
    },
    {
      name: "defaultActiveId",
      type: "string",
      default: "第一项",
      description: "非受控模式下的初始激活项。",
    },
    {
      name: "onActiveChange",
      type: "(id: string) => void",
      default: "—",
      description: "激活项变化回调。",
    },
    {
      name: "className",
      type: "string",
      default: "—",
      description: "透传类名。",
    },
  ],
  cssVariables: [
    { name: "--il-dock-radius", default: "26px", description: "Dock 圆角。" },
    {
      name: "--il-dock-blur-raw",
      default: "16px",
      description: "背景模糊原始值，会被档位上限截断。",
    },
    {
      name: "--il-dock-surface",
      default: "#0d1218",
      description: "降级与底色表面。",
    },
  ],
  degradation: [
    { tier: "high", behavior: "完整玻璃模糊 + 相邻缩放 + 指针光效。" },
    { tier: "mid", behavior: "模糊上限 10px，保留相邻缩放与边缘高光。" },
    { tier: "low", behavior: "不透明 Dock + 静态边框，禁用缩放和指针光效。" },
    {
      tier: "reduced-motion",
      behavior: "禁用缩放与指针光效，保留静态 Dock。",
    },
  ],
  a11y: [
    "链接使用 aria-current，按钮使用 aria-pressed 表示激活态。",
    "所有项可通过键盘聚焦，并有可见的 :focus-visible 轮廓。",
    "相邻缩放使用 :has 渐进增强，不支持时不影响可用性。",
  ],
  browserNotes: [
    "Safari 需要 -webkit-backdrop-filter；不支持时回退为不透明 Dock。",
    ":has 相邻缩放为渐进增强，旧浏览器仅保留单项 hover。",
  ],
} satisfies ComponentMeta;
