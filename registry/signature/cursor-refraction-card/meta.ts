import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "cursor-refraction-card",
  name: "CursorRefractionCard",
  displayName: "光标折射卡片",
  layer: "signature",
  tech: "svg",
  fidelity: "high",
  gpu: "high",
  priority: "P1",
  summary:
    "对可控背景做 SVG 位移折射，指针在内侧移动时背景产生视差，边缘与环境光同时响应；没有真实 DOM 背景采样，避免虚假承诺。",
  fallbackSummary: "blur + gradient / static image",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    { name: "backgroundSrc", type: "string", default: "—", description: "折射所用的背景图；不传时使用 background 或内置渐变。" },
    { name: "background", type: "string", default: "内置渐变", description: "CSS background 值，作为无图回退。" },
    { name: "displacement", type: "number", default: "10", description: "SVG 位移强度，范围 0–24。" },
    { name: "blur", type: "number", default: "2", description: "背景模糊像素值。" },
    { name: "radius", type: "number", default: "28", description: "卡片圆角。" },
    { name: "tier", type: '"auto" | "high" | "mid" | "low"', default: '"auto"', description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。" },
  ],
  cssVariables: [
    { name: "--il-cursor-card-radius", default: "28px", description: "卡片圆角。" },
    { name: "--il-cursor-card-blur", default: "2px", description: "背景模糊值。" },
    { name: "--il-refract-x", default: "0px", description: "背景横向视差，由运行时写入。" },
    { name: "--il-refract-y", default: "0px", description: "背景纵向视差，由运行时写入。" },
  ],
  degradation: [
    { tier: "high", behavior: "SVG 位移折射 + 指针视差 + 环境光/边缘光。" },
    { tier: "mid", behavior: "保留静态 SVG 位移，降低环境光强度。" },
    { tier: "low", behavior: "移除 SVG 位移与指针光效，保留 blur + 背景图。" },
    { tier: "reduced-motion", behavior: "禁用视差与指针光效，保留静态折射。" },
  ],
  a11y: [
    "背景与光效层 aria-hidden，内容位于最上层。",
    "文字使用固定浅色 + 底部 scrim，保证图像背景上的可读性。",
    "减少动态模式下关闭视差与高光跟随。",
  ],
  browserNotes: [
    "真实折射只作用于组件内可控背景；Web 端无法稳定采样任意 DOM 背景。",
    "SVG 位移滤镜成本与卡片面积相关；中端设备建议 static 模式。",
  ],
} satisfies ComponentMeta;
