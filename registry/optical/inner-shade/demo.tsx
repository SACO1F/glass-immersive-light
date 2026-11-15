import { InnerShade } from "./index";

export function InnerShadeDemo() {
  return (
    <InnerShade className="w-full max-w-sm" radius={26} depth={0.85}>
      <div className="p-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
          InnerShade
        </p>
        <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[var(--il-text)]">
          厚度来自暗部
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
          光源在外部移动时，内侧暗部会朝相反方向加深，形成环境遮蔽的厚度感。
        </p>
      </div>
    </InnerShade>
  );
}
