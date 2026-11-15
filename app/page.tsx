import type { Metadata } from "next";
import Link from "next/link";
import { PrismStage } from "@/components/home/prism-stage";
import { ComponentThumb } from "@/components/library/component-thumb";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { getComponentMeta } from "@/lib/registry/catalog";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl.toString(),
  description: siteDescription,
  inLanguage: "zh-CN",
};

const layers = [
  {
    index: "01",
    slug: "optical" as const,
    title: "光学原语",
    en: "Optical primitives",
    description:
      "把边缘高光、内阴影、模糊折射、色散与环境光拆到最小。它们是可组合的积木，也是整套材质的物理底座。",
    items: ["RimLight", "InnerShade", "BlurRefraction", "ChromaticEdge", "AmbientLight"],
    meta: "5 components · CSS / SVG",
  },
  {
    index: "02",
    slug: "scene" as const,
    title: "场景组件",
    en: "Optical scenes",
    description:
      "导航、Dock、卡片、按钮与弹窗。光学积木在这里组装成可直接使用的界面场景，并内置完整的降级路径。",
    items: ["OpticalNavbar", "FluidGlassDock", "RefractiveCard", "SheenButton", "ImmersiveModal"],
    meta: "5 components · CSS",
  },
  {
    index: "03",
    slug: "signature" as const,
    title: "原创特色",
    en: "Signature interactions",
    description:
      "光标折射、液态光池、磁性高光、焦点脉冲与涟漪。光不再只是皮肤，而是交互本身的物理反馈。",
    items: ["CursorRefractionCard", "LiquidLightPool", "MagneticSheenButton", "FocusPulseForm", "RipplePool"],
    meta: "5 components · SVG / WebGL",
  },
];

const featuredSlugs = [
  { slug: "refractive-card", size: "wide" },
  { slug: "liquid-light-pool", size: "narrow" },
  { slug: "cursor-refraction-card", size: "wide" },
  { slug: "sheen-button", size: "narrow" },
] as const;

const tiers = [
  {
    tier: "T1",
    title: "完整光路",
    condition: "桌面 · WebGL2 · 高性能",
    description:
      "WebGL 光池、SVG 折射与多层玻璃全部开放。适用于大屏、展示页和交互演示。",
  },
  {
    tier: "T2",
    title: "CSS 玻璃",
    condition: "移动端 · 中端设备 · 粗指针",
    description:
      "保留边缘光与环境色，backdrop blur 上限 10px，不创建 WebGL 上下文。",
  },
  {
    tier: "T3",
    title: "静态表面",
    condition: "低端设备 · saveData · 减少透明度",
    description:
      "退回不透明表面、静态阴影与实色边缘。信息与层级完整保留，光效停止。",
  },
];

const marqueeItems = [
  "RimLight",
  "InnerShade",
  "BlurRefraction",
  "ChromaticEdge",
  "AmbientLight",
  "OpticalNavbar",
  "FluidGlassDock",
  "RefractiveCard",
  "SheenButton",
  "ImmersiveModal",
  "CursorRefractionCard",
  "LiquidLightPool",
  "MagneticSheenButton",
  "FocusPulseForm",
  "RipplePool",
];

export default function Home() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />

      <section className="shell hero">
        <div className="hero__copy">
          <h1 className="display-xl hero__title">
            把光，做成
            <br />
            <span className="spectral-text">可复制的交互</span>
          </h1>

          <p className="lede hero__lede">
            ImmersiveLight 是一个以物理光学为灵感的 React 动效组件库。
            折射、边缘高光与环境光被拆成可组合的组件，复制源码即可接入；
            设备降级、减少动态与回退路径都写在代码里。
          </p>

          <div className="hero__actions">
            <Link className="btn btn--primary" href="/components">
              浏览 15 个组件
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3.5 8h9M8.5 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link className="btn" href="/docs">
              阅读接入文档
            </Link>
            <Link className="btn btn--ghost" href="/lab">
              Optical Lab
            </Link>
          </div>

          <div className="hero__meta">
            <span>
              <i aria-hidden="true" />
              CSS / SVG / WebGL
            </span>
            <span>
              <i aria-hidden="true" />
              复制即用 · 无运行时依赖
            </span>
            <span>
              <i aria-hidden="true" />
              T1–T3 自动降级
            </span>
          </div>
        </div>

        <div className="hero__visual">
          <PrismStage />
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span className="marquee__item" key={`${item}-${index}`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <Reveal>
        <section className="shell section-tight">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="display-md max-w-[18ch]">
                三层结构，共用一套降级契约
              </h2>
              <p className="lede mt-5">
                从光学积木到可交付场景，再到有辨识度的交互记忆点。
                每一层都按同一套档位规则运行。
              </p>
            </div>
            <Link className="btn btn--ghost btn--sm shrink-0" href="/components">
              查看全部组件
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3.5 8h9M8.5 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <div className="layer-index mt-12">
            {layers.map((layer) => (
              <Link
                key={layer.index}
                href={`/components?layer=${layer.slug}`}
                className="layer-row"
                data-spotlight=""
              >
                <span className="layer-row__num">{layer.index}</span>
                <div>
                  <h3 className="layer-row__title">{layer.title}</h3>
                  <p className="meta mt-2">{layer.en}</p>
                  <p className="layer-row__desc">{layer.description}</p>
                </div>
                <div className="layer-row__side" aria-hidden="true">
                  {layer.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={80}>
        <section className="shell section">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="display-md max-w-[20ch]">
                从一束光，到一整个界面
              </h2>
              <p className="lede mt-5">
                先看三个把光做成交互的组件。每个页面都可以切换背景、档位与变体。
              </p>
            </div>
            <span className="meta">Selected work · 03</span>
          </div>

          <div className="featured-grid mt-10">
            {featuredSlugs.map(({ slug, size }) => {
              const meta = getComponentMeta(slug);
              if (!meta) return null;

              return (
                <Link
                  key={slug}
                  href={`/components/${slug}`}
                  className={`featured-card featured-card--${size}`}
                  data-spotlight=""
                >
                  <div className="featured-card__visual">
                    <ComponentThumb slug={slug} className="absolute inset-0" />
                  </div>
                  <div className="featured-card__body">
                    <div>
                      <h3 className="featured-card__title">
                        {meta.displayName}
                      </h3>
                      <p className="featured-card__meta">
                        {meta.layer} · {meta.tech} · {meta.name}
                      </p>
                    </div>
                    <span className="featured-card__arrow" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                        <path
                          d="M4 12 12 4M6 4h6v6"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal delay={60}>
        <section className="shell section">
          <div className="tier-section">
            <div className="tier-sticky">
              <h2 className="display-lg max-w-[12ch]">
                一套材质，
                <br />
                三种代价。
              </h2>
              <p className="lede mt-6">
                档位不是主题，也不是预设。它由设备能力探测得出，
                并在组件根节点落成同一个 <code>data-il-tier</code>，
                CSS 与 WebGL 读取同一结果。
              </p>
              <Link className="btn mt-8" href="/docs#tiers">
                查看档位契约
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 8h9M8.5 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            <div className="tier-list">
              {tiers.map((row) => (
                <div key={row.tier} className="tier-row">
                  <span className="tier-row__index">{row.tier}</span>
                  <div>
                    <h3>{row.title}</h3>
                    <p className="meta mt-2">{row.condition}</p>
                    <p>{row.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={40}>
        <section className="shell section-tight">
          <div className="cta-panels">
            <div className="cta-panel" data-spotlight="">
              <div>
                <h2>接线之前，先读契约。</h2>
                <p>
                  三个文件如何放置、主题变量如何覆盖、档位如何解析，
                  以及哪些范围已经验证、哪些还没有。
                </p>
              </div>
              <Link className="btn btn--sm w-fit" href="/docs">
                阅读文档
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 8h9M8.5 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            <div className="cta-panel" data-spotlight="">
              <div>
                <h2>看我们怎样拆解光。</h2>
                <p>
                  Optical Lab 记录边缘高光、模糊折射与色散边缘的复刻过程，
                  包括失败方案和可验证的结论。
                </p>
              </div>
              <Link className="btn btn--sm w-fit" href="/lab">
                进入 Lab
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 8h9M8.5 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="closing">
        <div className="shell">
          <h2 className="closing__word text-balance">
            复制光，
            <br />
            而不是模仿光。
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link className="btn btn--primary" href="/components">
              开始挑选组件
            </Link>
            <Link className="btn btn--ghost" href="/legal">
              许可与边界
            </Link>
            <span className="meta sm:ml-auto">
              15 components · 3 layers · 1 contract
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
