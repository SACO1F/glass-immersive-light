import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "magnetic-sheen-button",
  name: "MagneticSheenButton",
  displayName: "磁性高光按钮",
  layer: "signature",
  tech: "css",
  fidelity: "medium",
  gpu: "low",
  priority: "P1",
  summary:
    "按钮会向指针方向轻微磁性偏移，同时用指针位置驱动表面高光与边缘光；离开后以弹簧回位。",
  fallbackSummary: "static button + hover",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    { name: "tier", type: '"auto" | "high" | "mid" | "low"', default: '"auto"', description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。" },
    { name: "intensity", type: "number", default: "0.8", description: "高光强度，范围 0–1。" },
    { name: "magnet", type: "number", default: "8", description: "最大磁性偏移像素。" },
    { name: "className", type: "string", default: "—", description: "透传类名。" },
  ],
  cssVariables: [
    { name: "--il-magnetic-radius", default: "999px", description: "按钮圆角。" },
    { name: "--il-magnet-x", default: "0px", description: "横向磁性偏移，由运行时写入。" },
    { name: "--il-magnet-y", default: "0px", description: "纵向磁性偏移，由运行时写入。" },
    { name: "--il-button-intensity", default: "0.8", description: "高光强度。" },
  ],
  degradation: [
    { tier: "high", behavior: "完整磁性偏移 + 指针高光 + 边缘光。" },
    { tier: "mid", behavior: "保留磁性偏移，降低高光强度。" },
    { tier: "low", behavior: "禁用磁性偏移与指针光效，保留静态按钮。" },
    { tier: "reduced-motion", behavior: "禁用磁性位移与过渡。" },
  ],
  a11y: [
    "原生 button 语义，默认 type=\"button\"。",
    "保留 :focus-visible、:disabled 与键盘操作。",
    "磁性位移不影响点击热区；触摸设备禁用磁性效果。",
  ],
  browserNotes: [
    "磁性偏移使用 transform，不触发布局重排。",
    "浅色模式切换高光混合模式为 normal。",
  ],
} satisfies ComponentMeta;
