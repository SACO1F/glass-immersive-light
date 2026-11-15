import type { Metadata } from "next";
import Link from "next/link";
import { getAllLabArticles } from "@/lib/lab/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Optical Lab",
  description:
    "记录光感材质的复刻过程、参数对照、浏览器差异和失败方案。",
  path: "/lab",
});

const method = [
  {
    step: "01",
    title: "先复刻",
    description: "拆解边缘、模糊、色散与光源方向，做最小可运行版本。",
  },
  {
    step: "02",
    title: "再对照",
    description: "在同一背景、同一指针位置下对照 CSS、SVG 与 WebGL。",
  },
  {
    step: "03",
    title: "标注差异",
    description: "把保真度、性能开销和降级方案写进组件页，而不是只放 Demo。",
  },
];

export default function LabPage() {
  const articles = getAllLabArticles();

  return (
    <div className="shell">
      <header className="page-head">
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">
              把复刻过程
              <br />
              公开出来
            </h1>
            <p className="lede mt-5 max-w-2xl">
              这里不展示「完美还原」，只展示可验证的差异、参数边界和失败方案。
              每个结论都对应当前组件页的 Fidelity / GPU / Fallback 标注。
            </p>
          </div>
          <p className="page-head__meta">
            LAB · 03 NOTES
            <br />
            <span className="text-[var(--site-subtle)]">Physics first</span>
          </p>
        </div>
      </header>

      <section aria-labelledby="method-title" className="section-tight">
        <div className="flex items-end justify-between gap-6">
          <h2 id="method-title" className="display-md max-w-[16ch]">
            复刻不是临摹截图
          </h2>
          <span className="meta hidden sm:block">Method · 03 steps</span>
        </div>

        <div className="lab-method mt-8">
          {method.map((item) => (
            <div key={item.step}>
              <b>{item.step}</b>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="notes-title" className="section-tight">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="notes-title" className="display-md">
              首批实验
            </h2>
            <p className="lede mt-4">
              三篇笔记分别对应边缘高光、模糊折射和色散边缘，
              均已落地为可复制组件。
            </p>
          </div>
          <Link className="btn btn--ghost btn--sm shrink-0" href="/components">
            查看全部组件
          </Link>
        </div>

        <div className="lab-grid mt-8">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/lab/${article.slug}`}
              className="lab-card"
              data-spotlight=""
            >
              <div>
                <span className="lab-card__index">
                  {article.order} / {article.eyebrow}
                </span>
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
              </div>

              <div className="lab-card__tags">
                {article.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-tight">
        <div className="panel p-6 sm:p-8">
          <h2 className="display-md max-w-[20ch]">
            Lab 不承诺 100% 还原任何平台
          </h2>
          <p className="lede mt-4">
            ImmersiveLight 的起点是物理光学，不是某个系统的皮肤。
            所有高保真方案都附带降级路径；如果某个效果只能在 T1 桌面设备成立，
            组件页会明确写出来。
          </p>
          <Link className="btn btn--sm mt-6" href="/legal">
            阅读许可与边界
          </Link>
        </div>
      </section>
    </div>
  );
}
