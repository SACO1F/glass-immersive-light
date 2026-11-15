import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/json-ld";
import {
  getAllLabArticles,
  getLabArticle,
} from "@/lib/lab/catalog";
import { pageMetadata, siteName, siteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLabArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getLabArticle(slug);

  if (!article) {
    return { title: "Lab Note" };
  }

  return pageMetadata({
    title: article.title,
    description: article.summary,
    path: `/lab/${article.slug}`,
    type: "article",
  });
}

export default async function LabArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getLabArticle(slug);

  if (!article) notFound();

  const articles = getAllLabArticles();
  const currentIndex = articles.findIndex((item) => item.slug === slug);
  const previous = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < articles.length - 1
      ? articles[currentIndex + 1]
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.summary,
    url: new URL(`/lab/${article.slug}`, siteUrl).toString(),
    articleSection: article.eyebrow,
    keywords: article.topics.join(", "),
    inLanguage: "zh-CN",
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl.toString(),
    },
  };

  return (
    <div className="shell">
      <JsonLd data={jsonLd} />

      <Link href="/lab" className="meta inline-flex pt-10 hover:text-[var(--site-text)]">
        ← Optical Lab
      </Link>

      <header className="mt-8 max-w-3xl">
        <h1 className="page-head__title">{article.title}</h1>
        <p className="meta mt-5">
          {article.order} / {article.eyebrow}
        </p>
        <p className="lede mt-4">{article.summary}</p>
      </header>

      <div className="article-layout">
        <article className="article-body">
          <div className="panel p-6 sm:p-7">
            <p className="meta">Conclusion</p>
            <p className="mt-3 text-[15px] leading-8 text-[var(--site-text)]">
              {article.conclusion}
            </p>
          </div>

          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 grid gap-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--site-accent)]"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section>
            <h2>实现方式对照</h2>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    {["维度", "CSS", "SVG", "WebGL"].map((label) => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {article.comparison.map((row) => (
                    <tr key={row.dimension}>
                      <th
                        scope="row"
                        className="font-medium text-[var(--site-text)]"
                      >
                        {row.dimension}
                      </th>
                      <td>{row.css}</td>
                      <td>{row.svg}</td>
                      <td>{row.webgl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <section className="panel p-6">
              <p className="meta">Failures</p>
              <h2 className="!mt-3 !text-xl">失败方案</h2>
              <ul className="mt-4 grid gap-3">
                {article.failures.map((failure) => (
                  <li key={failure} className="text-[13px] leading-7">
                    — {failure}
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel p-6">
              <p className="meta">Takeaways</p>
              <h2 className="!mt-3 !text-xl">可验证结论</h2>
              <ul className="mt-4 grid gap-3">
                {article.takeaways.map((takeaway) => (
                  <li key={takeaway} className="text-[13px] leading-7">
                    — {takeaway}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <aside className="article-aside">
          <div className="article-panel">
            <h2>对应组件</h2>
            <p>
              结论已落地为可复制组件，包含 Props、降级矩阵和可访问性说明。
            </p>
            <Link
              className="btn btn--primary btn--sm"
              href={`/components/${article.componentSlug}`}
            >
              打开组件
            </Link>
          </div>

          <div className="article-panel">
            <h2>Topics</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-md border border-[var(--site-line)] px-2 py-1 font-mono text-[9px] text-[var(--site-subtle)]"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="article-panel">
            <h2>Next step</h2>
            <p>
              在组件页切换 T1 / T2 / T3，观察同一结论在不同档位下的降级行为。
            </p>
          </div>
        </aside>
      </div>

      <nav className="flex flex-col gap-3 border-t border-[var(--site-line)] py-6 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <Link
            href={`/lab/${previous.slug}`}
            className="text-sm text-[var(--site-muted)] transition-colors hover:text-[var(--site-accent)]"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/lab/${next.slug}`}
            className="text-left text-sm text-[var(--site-muted)] transition-colors hover:text-[var(--site-accent)] sm:text-right"
          >
            {next.title} →
          </Link>
        ) : (
          <Link
            href="/components"
            className="text-left text-sm text-[var(--site-muted)] transition-colors hover:text-[var(--site-accent)] sm:text-right"
          >
            浏览全部组件 →
          </Link>
        )}
      </nav>
    </div>
  );
}
