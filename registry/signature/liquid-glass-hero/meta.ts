import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "liquid-glass-hero",
  name: "GlassHero",
  displayName: "液态玻璃旗舰",
  layer: "signature",
  tech: "webgl",
  fidelity: "medium",
  gpu: "high",
  priority: "P1",
  summary:
    "用组件自带场景做 WebGL 折射、Fresnel 边缘与可选色散；深色与浅色模式都使用 cool tinted glass，CSS 基座保持可用，不采样页面 DOM。",
  fallbackSummary: "CSS tint + Fresnel",
  dependencies: [],
  files: [
    "index.tsx",
    "styles.css",
    "use-optical-tier.ts",
    "liquid-glass-runtime.ts",
  ],
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
        "设备档位。auto 在 T1 尝试 WebGL，T2/T3 使用 CSS 基座。",
    },
    {
      name: "backend",
      type: '"auto" | "webgl" | "css"',
      default: '"auto"',
      description:
        "渲染后端。css 强制基座；webgl 强制尝试 WebGL；auto 按档位与可访问性偏好决定。",
    },
    {
      name: "material",
      type: '"liquid-glass"',
      default: '"liquid-glass"',
      description: "该旗舰组件固定为液态玻璃材质。",
    },
    {
      name: "refraction",
      type: "number",
      default: "0.35",
      description:
        "场景位移强度，范围 0–1；仅 WebGL 后端生效，CSS 基座不产生真实位移。",
    },
    {
      name: "dispersion",
      type: "number",
      default: "0",
      description:
        "色散强度，范围 0–1；默认关闭。开启后 RGB 通道使用不同 UV 偏移。",
    },
    {
      name: "fresnel",
      type: "number",
      default: "0.7",
      description: "边缘 Fresnel 高光强度，范围 0–1。",
    },
    {
      name: "radius",
      type: "number",
      default: "28",
      description: "圆角像素值；CSS 与 WebGL SDF 使用同一值。",
    },
    {
      name: "backgroundSrc",
      type: "string",
      default: "—",
      description:
        "可选场景图片。组件只折射该受控场景，不折射页面 DOM；跨域图片需要 CORS。",
    },
    {
      name: "paused",
      type: "boolean",
      default: "false",
      description: "暂停指针驱动的边缘光更新。",
    },
    {
      name: "onBackendChange",
      type: '(backend: "webgl" | "css") => void',
      default: "—",
      description: "后端切换回调，用于外部状态与诊断。",
    },
    {
      name: "className",
      type: "string",
      default: "—",
      description: "透传类名，通常用于控制宽度与布局。",
    },
  ],
  cssVariables: [
    {
      name: "--il-hero-radius",
      default: "28px",
      description: "圆角，由 radius prop 写入。",
    },
    {
      name: "--il-hero-blur",
      default: "18px",
      description: "CSS 基座模糊值，仍受 --il-tier-blur-max 截断。",
    },
    {
      name: "--il-hero-tint",
      default: "theme-derived",
      description:
        "CSS 基座 tint；深色为 cool cyan，浅色为 pale cyan，不依赖内部加亮。",
    },
    {
      name: "--il-hero-tint-2",
      default: "theme-derived",
      description:
        "第二个 tint 停靠点；深色为 indigo，浅色为 lavender，与 --il-hero-tint 组成斜向 tinted glass。",
    },
    {
      name: "--il-lg-tint-cool",
      default: "theme-derived",
      description:
        "液态玻璃 cool tint 停靠点；深色 cyan、浅色 pale cyan。",
    },
    {
      name: "--il-lg-tint-violet",
      default: "theme-derived",
      description:
        "液态玻璃 indigo/lavender tint 停靠点，与 --il-lg-tint-cool 配合。",
    },
    {
      name: "--il-lg-fresnel-alpha",
      default: "0.55 / 0.72 (light)",
      description: "Fresnel 边缘强度，WebGL 与 CSS 基座共用。",
    },
  ],
  degradation: [
    {
      tier: "high",
      behavior:
        "尝试 WebGL2，其次 WebGL1；启用场景折射、Fresnel 与可选色散。",
    },
    {
      tier: "mid",
      behavior:
        "不创建 WebGL；CSS tint + blur ≤ 10px + Fresnel 近似边缘。",
    },
    {
      tier: "low",
      behavior: "不透明表面，无 backdrop-filter、无位移与色散。",
    },
    {
      tier: "reduced-motion",
      behavior: "不创建 WebGL；使用 CSS 基座，不跟随指针。",
    },
  ],
  a11y: [
    "canvas 与装饰层 aria-hidden，内容始终在 DOM 内容层。",
    "尊重 prefers-reduced-motion：不启用 WebGL 指针折射。",
    "尊重 prefers-reduced-transparency：强制 CSS 不透明基座。",
    "prefers-contrast: more 下隐藏场景并使用实色表面。",
    "浅色模式使用 cool cyan tint 与 Fresnel 边缘维持玻璃感，不使用内部加亮光晕。",
    "深色模式使用 cool cyan + indigo tint，避免只靠白色高光维持玻璃感。",
    "焦点元素位于内容层，焦点环不被 canvas 裁剪。",
    "场景为装饰性纹理；需要语义时请通过 children 提供文本。",
  ],
  browserNotes: [
    "降级链为 WebGL2 → WebGL1 → CSS；WebGPU 尚未接入。",
    "WebGL 只采样组件自带场景或 backgroundSrc，不采样页面 DOM。",
    "远程 backgroundSrc 需要 CORS；纹理上传失败时回退 CSS。",
    "CSS 基座只有 tint、模糊与 Fresnel 近似描边，没有真实位移或色散。",
  ],
  materials: [
    {
      id: "liquid-glass",
      backends: ["webgl", "css"],
      fidelity: "medium",
      gpu: "high",
      dispersion: "opt-in",
      fallback: "CSS tint + Fresnel",
    },
  ],
} satisfies ComponentMeta;
