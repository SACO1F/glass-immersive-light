"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { href: "/components", label: "组件", index: "01" },
  { href: "/lab", label: "Optical Lab", index: "02" },
  { href: "/docs", label: "文档", index: "03" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, window.scrollY / max));

      setScrolled(window.scrollY > 10);

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !open) return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <header className="site-header" data-scrolled={scrolled}>
        <span ref={progressRef} className="site-progress" aria-hidden="true" />
        <div className="shell site-header__inner">
          <Link href="/" className="site-logo" aria-label="ImmersiveLight 首页">
            <span className="site-logo__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M12 3.5 20 19H4L12 3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M12 9.5v9.5M2 12h4M18 12h4"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.65"
                />
              </svg>
            </span>
            <span>IMMERSIVE LIGHT</span>
          </Link>

          <nav className="site-nav" aria-label="主导航">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="site-nav__link"
                data-active={isActive(pathname, item.href)}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-actions">
            <span className="site-status">
              <span className="site-status__dot" aria-hidden="true" />
              16 components
            </span>
            <ThemeToggle />
            <Link className="btn btn--sm btn--header" href="/docs">
              开始使用
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
            <button
              ref={toggleRef}
              type="button"
              className="site-menu-toggle"
              aria-label={open ? "关闭菜单" : "打开菜单"}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span style={open ? { transform: "translateY(5px) rotate(45deg)" } : undefined} />
              <span style={open ? { opacity: 0 } : undefined} />
              <span style={open ? { transform: "translateY(-5px) rotate(-45deg)" } : undefined} />
            </button>
          </div>
        </div>
      </header>

      <nav
        id="site-menu"
        className="site-menu"
        data-open={open}
        aria-label="移动导航"
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="site-menu__link"
            onClick={() => setOpen(false)}
          >
            {item.label}
            <span>{item.index}</span>
          </Link>
        ))}
        <Link
          href="/legal"
          className="site-menu__link"
          onClick={() => setOpen(false)}
        >
          许可与边界
          <span>04</span>
        </Link>

        <div className="site-menu__foot">
          <span className="meta">Optical component library</span>
          <Link
            className="btn btn--primary btn--sm"
            href="/docs"
            onClick={() => setOpen(false)}
          >
            开始使用
          </Link>
        </div>
      </nav>
    </>
  );
}
