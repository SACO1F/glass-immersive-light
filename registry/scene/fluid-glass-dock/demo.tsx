import { FluidGlassDock } from "./index";

const items = [
  { id: "home", label: "首页" },
  { id: "components", label: "组件" },
  { id: "light", label: "光效" },
  { id: "docs", label: "文档" },
  { id: "lab", label: "Lab" },
];

export function FluidGlassDockDemo() {
  return <FluidGlassDock items={items} defaultActiveId="components" />;
}
