import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "文档",
  description:
    "ImmersiveLight 的快速开始、双材质、主题变量、设备分级和可访问性约定。",
  path: "/docs",
});

const codeSnippet = `// 1. 打开任意组件页，点击「复制全部」
// 2. 将 index.tsx、styles.css 与 use-optical-tier.ts 放到同一目录
// 3. 直接引入：

import { RefractiveCard } from "./refractive-card";

export function Demo() {
  return (
    <RefractiveCard>
      <p>复制即用，不依赖 Tailwind。</p>
    </RefractiveCard>
  );
}`;

const themeSnippet = `:root {
  --il-surface: #0d1218;
  --il-text: #f2f7fb;
  --il-accent: #8fd8ff;
}

[data-theme="light"] {
  --il-surface: #ffffff;
  --il-text: #0b131a;
  --il-accent: #087ea4;
}`;

const materialSnippet = `<RefractiveCard material="liquid-glass" variant="frosted">
  <p>液态玻璃的 CSS 基座。</p>
</RefractiveCard>`;

const tierSnippet = `<!-- 最近的 data-tier 作用域 -->
<div data-tier="low">
  <RefractiveCard>...</RefractiveCard>
</div>

// 显式覆盖，优先级最高
<RefractiveCard tier="mid">...</RefractiveCard>

// 或在站点 URL 上强制档位
?tier=low`;

const sections = [
  ["快速开始", "#start"],
  ["复制全部", "#copy"],
  ["双材质", "#material"],
  ["主题变量", "#theme"],
  ["设备分级", "#tiers"],
  ["可访问性", "#a11y"],
];

export default function DocsPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">
              复制、主题
              <br />
              材质与设备分级
            </h1>
            <p className="lede mt-5 max-w-2xl">
              ImmersiveLight 不使用 npm 包分发组件。每个组件页都提供完整源码，
              复制到项目即可；主题、材质、档位探测与降级策略都在源码内。
            </p>
          </div>
          <p className="page-head__meta">
            DOCS · 06 SECTIONS
            <br />
            <span className="text-[var(--site-subtle)]">Updated 2026-11</span>
          </p>
        </div>
      </header>

      <div className="doc-layout">
        <nav aria-label="文档目录" className="doc-toc">
          <p className="meta mb-3">On this page</p>
          {sections.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="doc-content">
          <section id="start" className="doc-section scroll-mt-28">
            <h2>快速开始</h2>
            <p>
              组件源码不依赖 Tailwind，也不依赖站点内部路径别名。每个组件的
              <code>index.tsx</code> 只导入 React、同目录的
              <code>styles.css</code> 与 <code>use-optical-tier.ts</code>。
            </p>
            <pre>
              <code>{codeSnippet}</code>
            </pre>
          </section>

          <section id="copy" className="doc-section scroll-mt-28">
            <h2>复制全部</h2>
            <p>
              组件页的代码工具栏提供两种复制方式：复制当前文件，或复制全部文件。
              复制全部会把 TSX、CSS 与档位运行时用文件头分隔后合并；
              实际接入时请拆回同目录的三个文件，否则
              <code>./use-optical-tier</code> 的导入会失效。
              GlassHero 额外包含 <code>liquid-glass-runtime.ts</code>，共四个文件。
            </p>
            <p>
              目前 16 个组件均通过空项目 TypeScript 夹具检查，
              确保没有内部路径别名和缺失类型。
            </p>
          </section>

          <section id="material" className="doc-section scroll-mt-28">
            <h2>双材质</h2>
            <p>
              沉浸光感是“光落在表面”，液态玻璃是“光穿过介质”。
              <code>material</code> 不是主题，也不是皮肤切换：它改变
              图层结构与渲染后端，<code>theme</code> 仍只控制深浅色，
              <code>tier</code> 仍控制档位。
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="tier-card">
                <b>IMMERSIVE LIGHT</b>
                <p className="font-medium text-[var(--site-text)]">
                  光落在表面
                </p>
                <p>
                  环境光、边缘高光、内阴影与指针高光。默认材质，
                  保持现有组件行为。
                </p>
              </div>
              <div className="tier-card">
                <b>LIQUID GLASS</b>
                <p className="font-medium text-[var(--site-text)]">
                  光穿过介质
                </p>
                <p>
                  当前为 CSS 基座：tint、背景模糊与 Fresnel 近似描边。
                  没有真实背景位移或色散。
                </p>
              </div>
            </div>
            <pre>
              <code>{materialSnippet}</code>
            </pre>
            <p>
              <code>material=&quot;auto&quot;</code> 会读取最近祖先的
              <code>data-il-material</code> 作用域；没有作用域时使用
              immersive-light。CSS 基座诚实地只提供 frosted glass；
              GlassHero 的 WebGL 后端对组件自带场景做折射与色散，
              仍然不采样页面 DOM。深色与浅色模式都使用 cool tinted glass：
              深色为 cyan/indigo，浅色为 pale cyan/lavender，不依赖内部加亮。
            </p>
          </section>

          <section id="theme" className="doc-section scroll-mt-28">
            <h2>主题变量</h2>
            <p>
              组件使用 <code>--il-*</code> 变量。站点级 Token 放在
              <code>styles/tokens.css</code>，组件内部还提供局部变量覆盖。
              浅色模式通过 <code>data-theme=&quot;light&quot;</code> 切换。
            </p>
            <p>
              独立复制时，组件 CSS 对关键颜色提供了回退值；
              浅色模式与站点级表面色仍需复制
              <code>styles/tokens.css</code> 或自行定义同名变量。
            </p>
            <pre>
              <code>{themeSnippet}</code>
            </pre>
          </section>

          <section id="tiers" className="doc-section scroll-mt-28">
            <h2>设备分级</h2>
            <div className="tier-cards">
              <div className="tier-card">
                <b>T1</b>
                <p className="font-medium text-[var(--site-text)]">
                  桌面 / WebGL2 / 高性能
                </p>
                <p>完整 WebGL、SVG 与多层玻璃。</p>
              </div>
              <div className="tier-card">
                <b>T2</b>
                <p className="font-medium text-[var(--site-text)]">
                  移动 / 中端 / 粗指针
                </p>
                <p>CSS 玻璃 + 轻量 SVG，blur ≤ 10px。</p>
              </div>
              <div className="tier-card">
                <b>T3</b>
                <p className="font-medium text-[var(--site-text)]">
                  低端 / saveData / 减少透明度
                </p>
                <p>不透明表面、静态边缘、无指针光效。</p>
              </div>
            </div>
            <pre>
              <code>{tierSnippet}</code>
            </pre>
            <p>
              解析顺序：显式 <code>tier</code> → 最近的
              <code>[data-tier]</code> → 本机能力探测。组件会把最终档位写到自己的
              <code>data-il-tier</code>，CSS 与 WebGL 使用同一结果，
              预览中的 T1/T2/T3 会覆盖全局档位。
            </p>
            <p>
              减少动态不是档位：它由每个组件单独处理，
              停止指针光源、视差、磁性位移与扩散动画，但不会伪装成 T3。
              例如光池在 T1 + 减少动态下仍报告 <code>high</code>，
              只是不创建 WebGL canvas。
            </p>
            <div className="mt-6 rounded-[var(--site-radius-sm)] border border-dashed border-[var(--site-line-strong)] p-5">
              <p className="meta">Verified scope</p>
              <p className="mt-3 text-[13px] leading-7 text-[var(--site-muted)]">
                当前行为证据来自 Chromium（Edge）桌面无头浏览器与 390×844
                移动模拟。尚未覆盖 Safari、Firefox、iOS/Android 真机、
                屏幕阅读器与 GPU 帧率 / 功耗；组件页的 Fidelity / GPU
                徽章是开发期预估，不是基准测试结果。
              </p>
            </div>
          </section>

          <section id="a11y" className="doc-section scroll-mt-28">
            <h2>可访问性</h2>
            <ul className="a11y-list mt-4">
              <li>
                尊重 <code>prefers-reduced-motion</code>：关闭视差、磁性位移、
                扩散动画与指针光源跟随；运行中切换也会立即生效。
              </li>
              <li>
                尊重 <code>prefers-reduced-transparency</code>：
                玻璃退回不透明表面。
              </li>
              <li>焦点环不被装饰层裁剪；表单保留 <code>:focus-visible</code>。</li>
              <li>
                弹窗使用原生 <code>dialog</code>，保留焦点陷阱、Esc 关闭与焦点恢复。
              </li>
              <li>指针光效是增强，不承载唯一信息。</li>
            </ul>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-[var(--site-line)] pt-8">
            <Link className="btn btn--primary btn--sm" href="/components">
              浏览组件
            </Link>
            <Link className="btn btn--ghost btn--sm" href="/lab">
              阅读 Optical Lab
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
