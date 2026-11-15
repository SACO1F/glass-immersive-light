import { AmbientLight } from "./index";

export function AmbientLightDemo() {
  return (
    <AmbientLight className="w-full max-w-sm" radius={26} intensity={0.85}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
        AmbientLight
      </p>
      <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[var(--il-text)]">
        光先于指针抵达
      </h3>
      <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
        鼠标还在卡片外时，环境光已经开始进入表面；越靠近，颜色与亮度越明显。
      </p>
    </AmbientLight>
  );
}
