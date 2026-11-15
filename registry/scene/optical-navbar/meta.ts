import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "optical-navbar",
  name: "OpticalNavbar",
  displayName: "光感导航栏",
  layer: "scene",
  tech: "css",
  fidelity: "medium",
  gpu: "low",
  priority: "P0",
  summary:
    "玻璃导航栏，指针在栏外移动时边缘高光和环境光仍会响应；指针进入内部后链接的 hover 与焦点态保持原有行为。",
  fallbackSummary: "opaque navbar + border",
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
      name: "brand",
      type: "ReactNode",
      default: "—",
      description: "左侧品牌区内容。",
    },
    {
      name: "sticky",
      type: "boolean",
      default: "false",
      description: "是否使用 sticky 定位。",
    },
    {
      name: "children",
      type: "ReactNode",
      default: "—",
      description: "导航链接区，通常传入 a 或 button。",
    },
    {
      name: "className",
      type: "string",
      default: "—",
      description: "透传类名。",
    },
  ],
  cssVariables: [
    { name: "--il-navbar-radius", default: "20px", description: "导航栏圆角。" },
    {
      name: "--il-navbar-blur-raw",
      default: "16px",
      description: "背景模糊原始值，会被档位上限截断。",
    },
    {
      name: "--il-navbar-tint",
      default: "rgb(255 255 255 / 0.06)",
      description: "玻璃色调叠加层。",
    },
    {
      name: "--il-navbar-surface",
      default: "#0d1218",
      description: "降级与底色表面。",
    },
  ],
  degradation: [
    { tier: "high", behavior: "完整玻璃模糊 + 指针边缘高光与环境光。" },
    { tier: "mid", behavior: "模糊上限 10px，保留边缘高光。" },
    { tier: "low", behavior: "不透明导航栏 + 静态边框，禁用指针光效。" },
    {
      tier: "reduced-motion",
      behavior: "禁用指针光效，保留静态玻璃层次。",
    },
  ],
  a11y: [
    "使用语义化 nav 根节点；调用方应提供 aria-label。",
    "链接和按钮保留可见的 :focus-visible 样式。",
    "指针光效是装饰层，不影响导航可用性。",
  ],
  browserNotes: [
    "Safari 需要 -webkit-backdrop-filter；不支持时回退为不透明导航栏。",
    "sticky + backdrop-filter 在部分浏览器上可能触发重绘，长页面建议实测。",
  ],
} satisfies ComponentMeta;
