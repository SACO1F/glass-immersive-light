"use client";

import { useEffect, useState } from "react";
import type { OpticalTier } from "@/lib/tier/types";

type PreviewTier = "auto" | OpticalTier;
type PreviewBackground = "dark" | "light" | "checker";

const tierOptions: Array<{
  value: PreviewTier;
  label: string;
  description: string;
}> = [
  { value: "auto", label: "Auto", description: "使用全局设备探测结果" },
  { value: "high", label: "T1", description: "高档：完整光学效果" },
  { value: "mid", label: "T2", description: "中档：CSS 玻璃，模糊上限 10px" },
  { value: "low", label: "T3", description: "低档：不透明表面，静态阴影" },
];

const backgroundOptions: Array<{
  value: PreviewBackground;
  label: string;
}> = [
  { value: "dark", label: "深色" },
  { value: "light", label: "浅色" },
  { value: "checker", label: "棋盘" },
];

type PreviewStageProps = {
  children: React.ReactNode;
  title?: string;
};

export function PreviewStage({ children, title }: PreviewStageProps) {
  const [tier, setTier] = useState<PreviewTier>("auto");
  const [background, setBackground] = useState<PreviewBackground>("dark");

  useEffect(() => {
    const root = document.documentElement;
    const syncBackground = () => {
      setBackground((current) =>
        current === "checker"
          ? current
          : root.dataset.theme === "light"
            ? "light"
            : "dark",
      );
    };

    syncBackground();
    const observer = new MutationObserver(syncBackground);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const stageStyle: React.CSSProperties | undefined =
    background === "dark"
      ? {
          background:
            "radial-gradient(65% 65% at 50% 22%, #13222e 0%, #070b10 74%)",
        }
      : background === "light"
        ? {
            background: "linear-gradient(135deg, #eef4f8, #dce8f0)",
          }
        : undefined;

  return (
    <div className="stage">
      <div className="stage__bar">
        <div className="stage__group">
          <span className="stage__label">背景</span>
          <div role="group" aria-label="预览背景">
            {backgroundOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={background === option.value}
                onClick={() => setBackground(option.value)}
                className="stage__option"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stage__group">
          <span className="stage__label">档位</span>
          <div role="group" aria-label="设备档位模拟">
            {tierOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                title={option.description}
                aria-pressed={tier === option.value}
                onClick={() => setTier(option.value)}
                className="stage__option"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        data-tier={tier === "auto" ? undefined : tier}
        role="region"
        aria-label={title ? `${title} 实时预览` : "组件实时预览"}
        className={[
          "stage__canvas",
          background === "checker" ? "il-checker" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-bg={background}
        style={stageStyle}
      >
        <span className="stage__badge">Interactive preview</span>
        {children}
      </div>
    </div>
  );
}
