import { LiquidLightPool } from "./index";

export function LiquidLightPoolDemo() {
  return (
    <LiquidLightPool
      className="w-full max-w-lg"
      colorA="#6fe7ff"
      colorB="#ff6f9c"
      blobCount={5}
      intensity={0.9}
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
          T1 · WebGL
        </p>
        <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[var(--il-text)]">
          拖拽液态光池
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
          在池中移动或按住拖动指针，光团会被吸引并重新融合；T2/T3 自动切换为 CSS 光斑。
        </p>
      </div>
    </LiquidLightPool>
  );
}
