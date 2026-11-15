import type { ComponentMeta } from "@/lib/registry/schema";

export const meta = {
  slug: "focus-pulse-form",
  name: "FocusPulseForm",
  displayName: "焦点光脉冲表单",
  layer: "signature",
  tech: "css",
  fidelity: "medium",
  gpu: "low",
  priority: "P1",
  summary:
    "输入框获得焦点时产生一次光脉冲，表单表面也会跟随指针产生环境光；减少动态模式下退化为静态焦点环。",
  fallbackSummary: "static focus ring",
  dependencies: [],
  files: ["index.tsx", "styles.css", "use-optical-tier.ts"],
  tier: { min: "low", default: "auto" },
  props: [
    { name: "tier", type: '"auto" | "high" | "mid" | "low"', default: '"auto"', description: "覆盖设备档位；auto 优先使用最近的 data-tier，没有作用域时按本机能力探测。" },
    { name: "intensity", type: "number", default: "0.8", description: "环境光强度，范围 0–1。" },
    { name: "className", type: "string", default: "—", description: "透传类名。" },
    { name: "onSubmit", type: "FormEventHandler", default: "—", description: "原生表单提交回调。" },
  ],
  cssVariables: [
    { name: "--il-form-radius", default: "26px", description: "表单容器圆角。" },
    { name: "--il-form-padding", default: "26px", description: "表单内边距。" },
    { name: "--il-form-surface", default: "#0d1218", description: "表单表面颜色。" },
    { name: "--il-form-intensity", default: "0.8", description: "环境光强度。" },
  ],
  degradation: [
    { tier: "high", behavior: "指针环境光 + 焦点光脉冲。" },
    { tier: "mid", behavior: "保留环境光与脉冲，强度降低。" },
    { tier: "low", behavior: "移除指针环境光，保留静态焦点环。" },
    { tier: "reduced-motion", behavior: "移除脉冲动画，仅保留焦点描边。" },
  ],
  a11y: [
    "焦点态使用 :focus-visible，键盘用户可见。",
    "脉冲只是增强，不影响标签、错误提示与提交状态。",
    "减少动态模式下禁用脉冲动画。",
  ],
  browserNotes: [
    "输入框样式只作用于表单内部的 input / textarea / select，不污染全局。",
    "浅色模式环境光使用 normal 混合。",
  ],
} satisfies ComponentMeta;
