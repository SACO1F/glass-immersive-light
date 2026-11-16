import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { ComponentThumb } from "@/components/library/component-thumb";
import { CodeBlock } from "@/components/preview/code-block";
import { PreviewStage } from "@/components/preview/preview-stage";
import { JsonLd } from "@/components/site/json-ld";
import { getAllComponentMeta, getComponentMeta } from "@/lib/registry/catalog";
import { getComponentFiles } from "@/lib/registry/files";
import { getUsageSnippet } from "@/lib/registry/usage";
import { pageMetadata, siteName, siteUrl } from "@/lib/site";
import { AmbientLightDemo } from "@/registry/optical/ambient-light/demo";
import { BlurRefractionDemo } from "@/registry/optical/blur-refraction/demo";
import { ChromaticEdgeDemo } from "@/registry/optical/chromatic-edge/demo";
import { InnerShadeDemo } from "@/registry/optical/inner-shade/demo";
import { RimLightDemo } from "@/registry/optical/rim-light/demo";
import { FluidGlassDockDemo } from "@/registry/scene/fluid-glass-dock/demo";
import { ImmersiveModalDemo } from "@/registry/scene/immersive-modal/demo";
import { OpticalNavbarDemo } from "@/registry/scene/optical-navbar/demo";
import { RefractiveCardDemo } from "@/registry/scene/refractive-card/demo";
import { SheenButtonDemo } from "@/registry/scene/sheen-button/demo";
import { CursorRefractionCardDemo } from "@/registry/signature/cursor-refraction-card/demo";
import { FocusPulseFormDemo } from "@/registry/signature/focus-pulse-form/demo";
import { GlassHeroDemo } from "@/registry/signature/liquid-glass-hero/demo";
import { LiquidLightPoolDemo } from "@/registry/signature/liquid-light-pool/demo";
import { MagneticSheenButtonDemo } from "@/registry/signature/magnetic-sheen-button/demo";
import { RipplePoolDemo } from "@/registry/signature/ripple-pool/demo";

const demos: Record<string, ComponentType | undefined> = {
  "rim-light": RimLightDemo,
  "inner-shade": InnerShadeDemo,
  "blur-refraction": BlurRefractionDemo,
  "chromatic-edge": ChromaticEdgeDemo,
  "ambient-light": AmbientLightDemo,
  "optical-navbar": OpticalNavbarDemo,
  "fluid-glass-dock": FluidGlassDockDemo,
  "refractive-card": RefractiveCardDemo,
  "sheen-button": SheenButtonDemo,
  "immersive-modal": ImmersiveModalDemo,
  "cursor-refraction-card": CursorRefractionCardDemo,
  "magnetic-sheen-button": MagneticSheenButtonDemo,
  "focus-pulse-form": FocusPulseFormDemo,
  "liquid-light-pool": LiquidLightPoolDemo,
  "liquid-glass-hero": GlassHeroDemo,
  "ripple-pool": RipplePoolDemo,
};

const layerLabels = {
  optical: "光学原语",
  scene: "场景组件",
  signature: "原创特色",
} as const;

const fidelityLabels = {
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

const gpuLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

const tierLabels = {
  high: "T1 · 高档",
  mid: "T2 · 中档",
  low: "T3 · 低档",
  "reduced-motion": "Reduced motion",
} as const;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllComponentMeta().map((meta) => ({ slug: meta.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getComponentMeta(slug);

  if (!meta) return {};

  return pageMetadata({
    title: meta.displayName,
    description: meta.summary,
    path: `/components/${meta.slug}`,
    type: "article",
  });
}

function MetaBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="detail-chip">
      <b>{label}</b>
      {value}
    </span>
  );
}

export default async function ComponentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getComponentMeta(slug);

  if (!meta) notFound();

  const files = await getComponentFiles(meta);
  const sourceKb =
    files.reduce(
      (total, file) => total + new TextEncoder().encode(file.raw).length,
      0,
    ) / 1024;
  const Demo = demos[meta.slug];
  const related = getAllComponentMeta()
    .filter((item) => item.layer === meta.layer && item.slug !== meta.slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: meta.name,
    alternateName: meta.displayName,
    description: meta.summary,
    url: new URL(`/components/${meta.slug}`, siteUrl).toString(),
    programmingLanguage: [
      "TypeScript",
      "CSS",
      ...(meta.tech.includes("svg") ? ["SVG"] : []),
      ...(meta.tech === "webgl" ? ["WebGL"] : []),
    ],
    runtimePlatform: "React",
    codeSampleType: "full",
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl.toString(),
    },
  };

  return (
    <div className="shell">
      <JsonLd data={jsonLd} />

      <header className="detail-head">
        <nav aria-label="面包屑" className="detail-breadcrumb">
          <Link href="/components">组件</Link>
          <span aria-hidden="true">/</span>
          <span>{layerLabels[meta.layer]}</span>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--site-muted)]">{meta.name}</span>
        </nav>

        <div className="detail-title-row">
          <div className="min-w-0">
            <h1 className="detail-title">{meta.displayName}</h1>
            <p className="detail-name">{meta.name}</p>
            <p className="detail-summary">{meta.summary}</p>
          </div>

          <div className="detail-chips">
            {meta.materials && meta.materials.length > 1 ? (
              <MetaBadge label="Material" value="Dual" />
            ) : null}
            <MetaBadge label="Fidelity" value={fidelityLabels[meta.fidelity]} />
            <MetaBadge label="GPU" value={gpuLabels[meta.gpu]} />
            <MetaBadge label="Fallback" value={meta.fallbackSummary} />
            <MetaBadge
              label="Source"
              value={`${sourceKb.toFixed(1)} KB`}
            />
            <p className="w-full font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--site-subtle)] lg:text-right">
              Badges are estimates · see verified scope
            </p>
          </div>
        </div>
      </header>

      <section className="detail-stage-wrap" aria-label="实时预览">
        <PreviewStage
          title={meta.name}
          materials={meta.materials?.map((item) => item.id)}
        >
          {Demo ? (
            <Demo />
          ) : (
            <p className="text-sm text-[var(--site-muted)]">Demo 尚未接入。</p>
          )}
        </PreviewStage>
      </section>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-block" aria-labelledby="usage-title">
            <div className="detail-block__title">
              <h2 id="usage-title">最小示例</h2>
              <span>03 files · same directory</span>
            </div>
            <p className="detail-prose">
              复制三个文件到同一目录后，用下面的入口挂载。
              <code className="mx-1 font-mono text-[var(--site-accent)]">
                tier
              </code>
              默认是 auto：优先读取最近的
              <code className="mx-1 font-mono text-[var(--site-accent)]">
                data-tier
              </code>
              ，没有作用域时按本机能力探测。
            </p>
            <div className="workbench mt-5">
              <pre className="workbench__usage">{getUsageSnippet(meta.slug)}</pre>
            </div>
          </section>

          <section className="detail-block" aria-labelledby="source-title">
            <div className="detail-block__title">
              <h2 id="source-title">复制组件</h2>
              <span>{meta.files.join(" + ")}</span>
            </div>
            <p className="detail-prose">
              组件源码不依赖 Tailwind，也不依赖站点内部路径别名。
              复制全部会把 TSX、CSS 与档位运行时合并；接入时请拆回同目录的三个文件。
            </p>
            <div className="mt-5">
              <CodeBlock files={files} />
            </div>
            <p className="mt-3 text-xs leading-6 text-[var(--site-subtle)]">
              依赖：
              {meta.dependencies.length
                ? meta.dependencies.join(", ")
                : "无"}
              。复制后请保留文件相对路径，或修改 import 以匹配你的目录结构。
            </p>
          </section>

          <section className="detail-block" aria-labelledby="props-title">
            <div className="detail-block__title">
              <h2 id="props-title">Props</h2>
              <span>{meta.props.length} entries</span>
            </div>
            <div className="workbench overflow-x-auto">
              <table className="spec-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.props.map((prop) => (
                    <tr key={prop.name}>
                      <th scope="row">
                        <code>{prop.name}</code>
                      </th>
                      <td>
                        <code>{prop.type}</code>
                      </td>
                      <td>{prop.default ?? "—"}</td>
                      <td>{prop.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="detail-block" aria-labelledby="variables-title">
            <div className="detail-block__title">
              <h2 id="variables-title">CSS Variables</h2>
              <span>{meta.cssVariables.length} entries</span>
            </div>
            <div className="workbench overflow-x-auto">
              <table className="spec-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Default</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.cssVariables.map((variable) => (
                    <tr key={variable.name}>
                      <th scope="row">
                        <code>{variable.name}</code>
                      </th>
                      <td>
                        <code>{variable.default}</code>
                      </td>
                      <td>{variable.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {meta.browserNotes.length ? (
            <section className="detail-block" aria-labelledby="browser-title">
              <div className="detail-block__title">
                <h2 id="browser-title">浏览器说明</h2>
                <span>Notes</span>
              </div>
              <ul className="a11y-list">
                {meta.browserNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="detail-aside">
          <section className="detail-aside-card" aria-labelledby="degrade-title">
            <h2 id="degrade-title">降级路径</h2>
            {meta.degradation.map((row) => (
              <div key={row.tier} className="degradation-row">
                <b>{tierLabels[row.tier]}</b>
                <p>{row.behavior}</p>
              </div>
            ))}
          </section>

          {meta.materials?.length ? (
            <section
              className="detail-aside-card"
              aria-labelledby="materials-title"
            >
              <h2 id="materials-title">材质支持</h2>
              {meta.materials.map((item) => (
                <div key={item.id} className="degradation-row">
                  <b>
                    {item.id === "liquid-glass"
                      ? "Liquid glass"
                      : "Immersive light"}
                  </b>
                  <p>
                    {item.backends.join(" / ").toUpperCase()} · Fidelity{" "}
                    {item.fidelity} · GPU {item.gpu} · Dispersion{" "}
                    {item.dispersion}
                  </p>
                  <p>{item.fallback}</p>
                </div>
              ))}
            </section>
          ) : null}

          <section className="detail-aside-card" aria-labelledby="a11y-title">
            <h2 id="a11y-title">可访问性</h2>
            <ul className="a11y-list">
              {meta.a11y.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="detail-aside-card">
            <h2>验证范围</h2>
            <p className="text-xs leading-6 text-[var(--site-muted)]">
              Fidelity 与 GPU 徽章是开发期预估，不代表基准测试。
              已覆盖 Chromium 桌面、Firefox 与 WebKit 冒烟、390×844 模拟；
              Safari 真机、移动真机、屏幕阅读器与帧率 / 功耗尚未验证。
            </p>
            <Link
              className="mt-4 inline-flex text-xs text-[var(--site-accent)] hover:opacity-80"
              href="/docs#tiers"
            >
              查看完整验证范围 →
            </Link>
          </section>
        </aside>
      </div>

      {related.length ? (
        <section className="section-tight" aria-labelledby="related-title">
          <div className="detail-block__title">
            <h2 id="related-title">同一层的其他组件</h2>
            <span>{layerLabels[meta.layer]}</span>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/components/${item.slug}`}
                className="related-card"
                data-spotlight=""
              >
                <span className="related-card__visual">
                  <ComponentThumb
                    slug={item.slug}
                    className="absolute inset-0"
                  />
                </span>
                <span className="related-card__title">{item.displayName}</span>
                <span className="related-card__meta">
                  {item.name} · {item.tech}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
