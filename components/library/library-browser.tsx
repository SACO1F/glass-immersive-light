"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { OpticalMaterial } from "@/lib/registry/schema";
import { ComponentThumb } from "./component-thumb";

export type LibraryItem = {
  slug: string;
  name: string;
  displayName: string;
  layer: "optical" | "scene" | "signature";
  priority: string;
  summary: string;
  tech: string;
  fidelity: "high" | "medium" | "low";
  gpu: "low" | "medium" | "high";
  materials: OpticalMaterial[];
};

const layerLabels = {
  optical: "光学原语",
  scene: "场景组件",
  signature: "原创特色",
} as const;

const filters = [
  { value: "all", label: "全部" },
  { value: "optical", label: "光学原语" },
  { value: "scene", label: "场景组件" },
  { value: "signature", label: "原创特色" },
] as const;

type LayerFilter = (typeof filters)[number]["value"];

function normalizeLayer(value: string | undefined): LayerFilter {
  if (value === "optical" || value === "scene" || value === "signature") {
    return value;
  }
  return "all";
}

export function LibraryBrowser({
  items,
  initialLayer,
}: {
  items: LibraryItem[];
  initialLayer?: string;
}) {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<LayerFilter>(() =>
    normalizeLayer(initialLayer),
  );

  useEffect(() => {
    setLayer(normalizeLayer(initialLayer));
  }, [initialLayer]);

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return items.filter((item) => {
      if (layer !== "all" && item.layer !== layer) return false;
      if (!keyword) return true;

      return [item.displayName, item.name, item.summary, item.tech]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [items, layer, query]);

  const selectLayer = (value: LayerFilter) => {
    setLayer(value);

    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (value === "all") {
      url.searchParams.delete("layer");
    } else {
      url.searchParams.set("layer", value);
    }
    window.history.replaceState(null, "", url);
  };

  return (
    <div>
      <div className="library-toolbar">
        <label className="library-search">
          <span className="sr-only">搜索组件</span>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10.5 10.5 14 14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="搜索组件名或用途"
          />
        </label>

        <div role="group" aria-label="按层筛选" className="library-filters">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={layer === option.value}
              onClick={() => selectLayer(option.value)}
              className="filter-pill"
            >
              {option.label}
            </button>
          ))}
        </div>

        <span className="library-count">
          {String(visible.length).padStart(2, "0")} /{" "}
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      {visible.length ? (
        <div className="library-grid">
          {visible.map((item, index) => (
            <Link
              key={item.slug}
              href={`/components/${item.slug}`}
              className="component-card"
              data-spotlight=""
              style={
                { "--card-delay": `${index * 35}ms` } as React.CSSProperties
              }
            >
              <div className="component-card__visual">
                <span className="component-card__index">
                  {String(
                    items.findIndex((entry) => entry.slug === item.slug) + 1,
                  ).padStart(2, "0")}
                </span>
                <ComponentThumb slug={item.slug} className="absolute inset-0" />
                <span className="component-card__tech">
                  {item.tech.toUpperCase()}
                </span>
              </div>

              <div className="component-card__body">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="component-card__title">
                      {item.displayName}
                    </h2>
                    <p className="component-card__name">{item.name}</p>
                  </div>
                  <span className="meta">{layerLabels[item.layer]}</span>
                </div>

                <p className="component-card__desc">{item.summary}</p>

                <div className="component-card__chips">
                  {item.materials.includes("liquid-glass") ? (
                    <span>Liquid glass</span>
                  ) : null}
                  <span>Fidelity {item.fidelity}</span>
                  <span>GPU {item.gpu}</span>
                  <span>{item.priority}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <p className="meta">No components matched</p>
          <p className="max-w-sm text-sm leading-7">
            没有匹配的组件。试试组件名、用途，或切换到「全部」。
          </p>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setQuery("");
              selectLayer("all");
            }}
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
