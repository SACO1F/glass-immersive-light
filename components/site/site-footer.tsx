import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__top">
        <p className="site-footer__word">
          Light,
          <br />
          made tangible.
        </p>

        <div className="site-footer__grid">
          <div className="site-footer__col">
            <h3>ImmersiveLight</h3>
            <p>
              以物理光学为灵感的 React 光感动效组件库。复制即用，按设备自动降级。
            </p>
            <p className="meta">Independent design project · 2026</p>
          </div>

          <div className="site-footer__col">
            <h3>产品</h3>
            <Link href="/components">组件库</Link>
            <Link href="/docs">文档</Link>
            <Link href="/lab">Optical Lab</Link>
          </div>

          <div className="site-footer__col">
            <h3>参考</h3>
            <Link href="/docs#tiers">档位契约</Link>
            <Link href="/docs#a11y">可访问性</Link>
            <Link href="/legal">许可与边界</Link>
          </div>

          <div className="site-footer__col">
            <h3>组件代码</h3>
            <Link href="/legal#license">MIT License</Link>
            <p>16 个组件</p>
            <p>T1 / T2 / T3</p>
          </div>
        </div>
      </div>

      <div className="shell site-footer__bottom">
        <span>© 2026 ImmersiveLight. 组件代码采用 MIT License.</span>
        <span className="meta">
          不隶属于华为或苹果，不宣称还原任何平台效果。
        </span>
      </div>
    </footer>
  );
}
