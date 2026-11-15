const usage: Record<string, string> = {
  "rim-light": `import { RimLight } from "./rim-light";

export function Demo() {
  return (
    <RimLight style={{ padding: 24 }}>
      <p>边缘高光会跟随指针靠近。</p>
    </RimLight>
  );
}`,
  "inner-shade": `import { InnerShade } from "./inner-shade";

export function Demo() {
  return (
    <InnerShade depth={0.7}>
      <p>内阴影会随光源位置移动。</p>
    </InnerShade>
  );
}`,
  "blur-refraction": `import { BlurRefraction } from "./blur-refraction";

export function Demo() {
  return (
    <BlurRefraction tint="frosted">
      <p>背景模糊上限由档位控制。</p>
    </BlurRefraction>
  );
}`,
  "chromatic-edge": `import { ChromaticEdge } from "./chromatic-edge";

export function Demo() {
  return (
    <ChromaticEdge intensity={0.85}>
      <p>边缘色散只在指针靠近时出现。</p>
    </ChromaticEdge>
  );
}`,
  "ambient-light": `import { AmbientLight } from "./ambient-light";

export function Demo() {
  return (
    <AmbientLight>
      <p>指针作为外部光源点亮环境光。</p>
    </AmbientLight>
  );
}`,
  "optical-navbar": `import { OpticalNavbar } from "./optical-navbar";

export function Demo() {
  return (
    <OpticalNavbar brand={<strong>Acme</strong>}>
      <a href="/">首页</a>
      <a href="/docs">文档</a>
    </OpticalNavbar>
  );
}`,
  "fluid-glass-dock": `import { FluidGlassDock } from "./fluid-glass-dock";

export function Demo() {
  return (
    <FluidGlassDock
      items={[
        { id: "home", label: "首页" },
        { id: "docs", label: "文档" },
        { id: "lab", label: "Lab" },
      ]}
    />
  );
}`,
  "refractive-card": `import { RefractiveCard } from "./refractive-card";

export function Demo() {
  return (
    <RefractiveCard variant="frosted">
      <h2>玻璃卡片</h2>
      <p>指针靠近时出现边缘光与倾斜。</p>
    </RefractiveCard>
  );
}`,
  "sheen-button": `import { SheenButton } from "./sheen-button";

export function Demo() {
  return <SheenButton variant="glass">开始体验</SheenButton>;
}`,
  "immersive-modal": `import { useState } from "react";
import { ImmersiveModal } from "./immersive-modal";

export function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>打开弹窗</button>
      <ImmersiveModal
        open={open}
        onOpenChange={setOpen}
        title="光感弹窗"
      >
        <p>按 Esc 或点击遮罩关闭。</p>
      </ImmersiveModal>
    </>
  );
}`,
  "cursor-refraction-card": `import { CursorRefractionCard } from "./cursor-refraction-card";

export function Demo() {
  return (
    <CursorRefractionCard backgroundSrc="/cover.jpg">
      <h2>指针折射</h2>
      <p>背景与边缘会跟随指针发生位移。</p>
    </CursorRefractionCard>
  );
}`,
  "magnetic-sheen-button": `import { MagneticSheenButton } from "./magnetic-sheen-button";

export function Demo() {
  return <MagneticSheenButton>跟随指针</MagneticSheenButton>;
}`,
  "focus-pulse-form": `import { FocusPulseForm } from "./focus-pulse-form";

export function Demo() {
  return (
    <FocusPulseForm>
      <label>
        邮箱
        <input type="email" placeholder="you@example.com" />
      </label>
      <label>
        留言
        <textarea rows={3} />
      </label>
    </FocusPulseForm>
  );
}`,
  "liquid-light-pool": `import { LiquidLightPool } from "./liquid-light-pool";

export function Demo() {
  return (
    <LiquidLightPool blobCount={5}>
      <p>拖拽指针吸引液态光团。</p>
    </LiquidLightPool>
  );
}`,
  "ripple-pool": `import { RipplePool } from "./ripple-pool";

export function Demo() {
  return (
    <RipplePool>
      <p>点击或按 Enter 产生涟漪。</p>
    </RipplePool>
  );
}`,
};

export function getUsageSnippet(slug: string): string {
  return usage[slug] ?? `import { Component } from "./${slug}";`;
}
