import Link from "next/link";
import { OpticalNavbar } from "./index";

export function OpticalNavbarDemo() {
  return (
    <OpticalNavbar
      aria-label="光感导航示例"
      className="w-full max-w-2xl"
      brand={
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[var(--il-accent)] shadow-[0_0_14px_var(--il-accent)]" />
          ImmersiveLight
        </span>
      }
    >
      <Link href="/components">组件</Link>
      <Link href="/lab">Lab</Link>
      <Link href="/docs">文档</Link>
    </OpticalNavbar>
  );
}
