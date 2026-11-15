import { RimLight } from "./index";

export function RimLightDemo() {
  return (
    <RimLight className="w-full max-w-sm" radius={26} intensity={0.8}>
      <div className="rounded-[26px] bg-[var(--il-surface)] p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
          RimLight
        </p>
        <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[var(--il-text)]">
          把边缘还给光
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
          鼠标移到卡片周围，高光会沿最近的边缘移动；移入内部后，内部层次仍然保留。
        </p>
      </div>
    </RimLight>
  );
}
