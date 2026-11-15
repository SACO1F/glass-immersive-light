import { ChromaticEdge } from "./index";

export function ChromaticEdgeDemo() {
  return (
    <ChromaticEdge className="w-full max-w-sm" radius={26} intensity={0.9}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--il-accent)]">
        ChromaticEdge
      </p>
      <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[var(--il-text)]">
        边缘的微型色散
      </h3>
      <p className="mt-3 text-sm leading-7 text-[var(--il-text-muted)]">
        SVG 湍流扰动一圈彩虹描边，只有指针接近时才显现，模拟镜头边缘的色散。
      </p>
    </ChromaticEdge>
  );
}
