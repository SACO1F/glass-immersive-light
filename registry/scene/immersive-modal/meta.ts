import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "immersive-modal",
  name: "ImmersiveModal",
  displayName: "光感弹窗",
  layer: "scene",
  tech: "css",
  fidelity: "medium",
  gpu: "low",
  priority: "P1",
  summary:
    "基于原生 dialog 的玻璃弹窗：保留焦点陷阱、Esc 关闭与焦点恢复，同时让指针在面板周围点亮边缘。",
  fallbackSummary: "opaque dialog",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    { name: "open", type: "boolean", default: "—", description: "受控打开状态。" },
    { name: "defaultOpen", type: "boolean", default: "false", description: "非受控初始状态。" },
    { name: "onOpenChange", type: "(open: boolean) => void", default: "—", description: "打开状态变化回调。" },
    { name: "title", type: "string", default: "—", description: "弹窗标题，用于 aria-labelledby。" },
    { name: "description", type: "string", default: "—", description: "可选描述，用于 aria-describedby。" },
    { name: "tier", type: '"auto" | "high" | "mid" | "low"', default: '"auto"', description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。" },
    { name: "closeLabel", type: "string", default: '"关闭弹窗"', description: "关闭按钮的无障碍标签。" },
  ],
  cssVariables: [
    { name: "--il-modal-radius", default: "28px", description: "弹窗圆角。" },
    { name: "--il-modal-surface", default: "#0d1218", description: "弹窗表面颜色。" },
    { name: "--il-light-x", default: "50%", description: "光源横向位置，由运行时写入。" },
  ],
  degradation: [
    { tier: "high", behavior: "玻璃模糊 + 指针环境光 + 边缘高光。" },
    { tier: "mid", behavior: "保留玻璃与边缘光，降低环境光强度。" },
    { tier: "low", behavior: "不透明弹窗 + 静态阴影，禁用指针光效。" },
    { tier: "reduced-motion", behavior: "禁用入场动画与指针光效。" },
  ],
  a11y: [
    "使用原生 dialog.showModal()，天然获得焦点陷阱、Esc 关闭与焦点恢复。",
    "标题与描述分别绑定 aria-labelledby / aria-describedby。",
    "关闭按钮有明确的 aria-label；点击遮罩可关闭。",
  ],
  browserNotes: [
    "原生 dialog 在 Safari 15.4+、Chrome 37+、Firefox 98+ 可用。",
    "::backdrop 的 backdrop-filter 支持不完整时会退化为纯色遮罩。",
  ],
} satisfies ComponentMeta;
