import { RipplePool } from "./index";

export function RipplePoolDemo() {
  return (
    <RipplePool className="w-full max-w-lg" intensity={0.85} maxRipples={7}>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
          RipplePool
        </p>
        <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[var(--il-text)]">
          点击水面
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
          在任意位置点击，或聚焦后按 Enter / Space，光池会从落点扩散一圈涟漪。
        </p>
      </div>
    </RipplePool>
  );
}
