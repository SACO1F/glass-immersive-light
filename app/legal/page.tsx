import type { Metadata } from "next";
import Link from "next/link";
import { siteDescription, siteName, siteOgAlt, siteUrl } from "@/lib/site";

const path = "/legal";

export const metadata: Metadata = {
  title: "许可与边界",
  description:
    "ImmersiveLight 的代码许可、站点内容版权、平台隶属关系与性能声明。",
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    url: path,
    siteName,
    title: "许可与边界 · ImmersiveLight",
    description: siteDescription,
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: siteOgAlt },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "许可与边界 · ImmersiveLight",
    description: siteDescription,
    images: ["/opengraph-image"],
  },
};

const sections = [
  {
    id: "license",
    title: "组件代码许可",
    paragraphs: [
      "registry/ 下的组件源码采用 MIT License。你可以用于个人与商业项目，可以修改、分发，也可以闭源使用。",
      "唯一要求是保留原始版权声明与许可声明；软件按「原样」提供，不附带任何明示或暗示的担保。完整文本见仓库根目录的 LICENSE 文件，复制组件时请一并保留。",
    ],
  },
  {
    id: "content",
    title: "站点内容",
    paragraphs: [
      "站点文案、Optical Lab 实验笔记、视觉设计与示例图片的版权归 ImmersiveLight 所有。",
      "欢迎引用结论并注明出处；整站复制或作为模板再分发前，请先通过项目仓库联系。",
    ],
  },
  {
    id: "affiliation",
    title: "平台隶属与商标",
    paragraphs: [
      "ImmersiveLight 是独立项目，不隶属于华为、苹果或任何操作系统厂商，也不代表官方实现。",
      "本站以物理光学为灵感进行独立设计，不宣称兼容或还原 HarmonyOS 沉浸光感、Apple Liquid Glass 或任何平台的视觉效果。相关名称与商标归各自所有者。",
    ],
  },
  {
    id: "performance",
    title: "性能与兼容声明",
    paragraphs: [
      "组件页的 Fidelity、GPU 与 T1 / T2 / T3 分级来自能力探测规则与开发环境观察，用于说明降级路径，不是性能基准。",
      "当前没有记录帧率、GPU 时间、功耗或温升数据；徽章属于开发期预估。实际表现取决于浏览器版本、GPU 驱动、屏幕色彩管理与系统可访问性设置，请在目标设备上自行验证后再上线。",
    ],
  },
  {
    id: "contact",
    title: "反馈",
    paragraphs: [
      "许可、署名或删除请求，请通过项目代码仓库的 Issue 提交，并附上相关页面链接。",
    ],
  },
];

export default function LegalPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">许可与边界</h1>
            <p className="lede mt-5 max-w-2xl">
              这里说明什么可以自由使用、什么需要授权，
              以及本站刻意不宣称的部分。
            </p>
          </div>
          <p className="page-head__meta">
            LEGAL · 05 SECTIONS
            <br />
            <span className="text-[var(--site-subtle)]">
              Last updated · 2026-11-13
            </span>
          </p>
        </div>
      </header>

      <div className="legal-layout">
        <nav aria-label="本页目录" className="doc-toc">
          <p className="meta mb-3">On this page</p>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </nav>

        <div>
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="legal-section scroll-mt-28"
            >
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div className="legal-license">
            <h2>MIT License</h2>
            <p>
              Permission is hereby granted, free of charge, to any person
              obtaining a copy of this software and associated documentation
              files, to deal in the Software without restriction, including
              without limitation the rights to use, copy, modify, merge,
              publish, distribute, sublicense, and/or sell copies of the
              Software, subject to the condition that the above copyright
              notice and this permission notice are included in all copies or
              substantial portions of the Software. THE SOFTWARE IS PROVIDED
              &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND.
            </p>
            <Link className="btn btn--ghost btn--sm mt-5" href="/docs">
              查看快速开始
            </Link>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--site-subtle)]">
            {siteName} · {siteUrl.hostname}
          </p>
        </div>
      </div>
    </div>
  );
}
