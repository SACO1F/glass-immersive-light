import type { Metadata } from "next";
import Link from "next/link";
import {
  LibraryBrowser,
  type LibraryItem,
} from "@/components/library/library-browser";
import { getAllComponentMeta } from "@/lib/registry/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "组件",
  description:
    "ImmersiveLight 首批 15 个光感组件，按光学原语、场景组件、原创特色三层组织。",
  path: "/components",
});

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ComponentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const layer = typeof params.layer === "string" ? params.layer : undefined;

  const items: LibraryItem[] = getAllComponentMeta().map((meta) => ({
    slug: meta.slug,
    name: meta.name,
    displayName: meta.displayName,
    layer: meta.layer,
    priority: meta.priority,
    summary: meta.summary,
    tech: meta.tech,
    fidelity: meta.fidelity,
    gpu: meta.gpu,
  }));

  return (
    <div className="shell">
      <header className="library-head">
        <div className="library-head__row">
          <div>
            <h1 className="page-head__title">组件库</h1>
            <p className="lede mt-5 max-w-2xl">
              15 个组件按光学原语、场景组件、原创特色三层组织，
              包含 CSS、SVG 与 WebGL 三种实现。全部组件已实现；
              跨浏览器、真机性能与无障碍验收仍在进行。
            </p>
          </div>
          <p className="library-head__count">
            15 / 15 implemented
            <br />
            <span className="text-[var(--site-subtle)]">
              3 layers · 1 tier contract
            </span>
          </p>
        </div>
      </header>

      <LibraryBrowser items={items} initialLayer={layer} />

      <div className="panel mt-14 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            15 / 15 已实现，发布验收进行中
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-7 text-[var(--site-muted)]">
            复制全部、空项目编译夹具与档位运行时已通过；Safari、移动真机与
            帧率 / 功耗基准尚未验证。组件页的 Fidelity 与 GPU 徽章是开发期预估。
          </p>
        </div>
        <Link className="btn btn--ghost btn--sm shrink-0" href="/docs#tiers">
          查看验证范围
        </Link>
      </div>
    </div>
  );
}
