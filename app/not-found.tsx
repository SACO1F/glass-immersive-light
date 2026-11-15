import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell notfound">
      <div>
        <h1 className="display-xl notfound__title">
          这一束光
          <br />
          没有照到这里
        </h1>
        <p className="meta mt-6">404 / Off the optical path</p>
        <p className="lede mt-5">
          页面可能已移动、重命名，或从未存在。
          可以回到组件库，或者从文档重新开始。
        </p>

        <div className="notfound__actions mt-9">
          <Link className="btn btn--primary" href="/components">
            浏览组件
          </Link>
          <Link className="btn" href="/">
            返回首页
          </Link>
          <Link className="btn btn--ghost" href="/docs">
            阅读文档
          </Link>
        </div>

        <p className="meta mt-16">
          ImmersiveLight · optical component library
        </p>
      </div>
    </div>
  );
}
