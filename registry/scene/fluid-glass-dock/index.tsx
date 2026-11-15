"use client";

import { useEffect, useRef, useState } from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type FluidGlassDockTier = "auto" | "high" | "mid" | "low";

export interface FluidGlassDockItem {
  id: string;
  label: string;
  href?: string;
}

export interface FluidGlassDockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: FluidGlassDockItem[];
  tier?: FluidGlassDockTier;
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string) => void;
}

function useAmbientLight(
  ref: React.RefObject<HTMLElement | null>,
  range: number,
) {
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia?.("(pointer: coarse)");
    let listening = false;

    const update = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
      const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
      const distance = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distance / range);

      element.style.setProperty("--il-light-x", `${clientX - rect.left}px`);
      element.style.setProperty("--il-light-y", `${clientY - rect.top}px`);
      element.style.setProperty(
        "--il-light-proximity",
        proximity.toFixed(3),
      );
    };

    const schedule = (clientX: number, clientY: number) => {
      pointerRef.current = { x: clientX, y: clientY };
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const pointer = pointerRef.current;
        if (pointer) update(pointer.x, pointer.y);
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      schedule(event.clientX, event.clientY);
    };

    const refresh = () => {
      const pointer = pointerRef.current;
      if (pointer) schedule(pointer.x, pointer.y);
    };

    const stop = () => {
      if (!listening) return;

      listening = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
      pointerRef.current = null;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      element.style.setProperty("--il-light-proximity", "0");
      element.style.removeProperty("--il-light-x");
      element.style.removeProperty("--il-light-y");
    };

    const start = () => {
      if (listening || motion?.matches || coarse?.matches) return;

      listening = true;
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("scroll", refresh, {
        passive: true,
        capture: true,
      });
      window.addEventListener("resize", refresh, { passive: true });
    };

    const sync = () => {
      if (motion?.matches || coarse?.matches) stop();
      else start();
    };

    const listen = (query: MediaQueryList | undefined) => {
      if (!query) return;

      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", sync);
      } else {
        query.addListener(sync);
      }
    };

    const unlisten = (query: MediaQueryList | undefined) => {
      if (!query) return;

      if (typeof query.removeEventListener === "function") {
        query.removeEventListener("change", sync);
      } else {
        query.removeListener(sync);
      }
    };

    sync();
    listen(motion);
    listen(coarse);

    return () => {
      stop();
      unlisten(motion);
      unlisten(coarse);
    };
  }, [ref, range]);
}

export function FluidGlassDock({
  items,
  tier = "auto",
  activeId,
  defaultActiveId,
  onActiveChange,
  className,
  ...rest
}: FluidGlassDockProps) {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId ?? items[0]?.id ?? "",
  );

  useAmbientLight(dockRef, 320);

  const currentId = activeId ?? internalActiveId;

  const handleSelect = (id: string) => {
    if (activeId === undefined) setInternalActiveId(id);
    onActiveChange?.(id);
  };

  const classes = ["il-fluid-dock", className].filter(Boolean).join(" ");

  const resolvedTier = useOpticalTier(dockRef, tier);

  return (
    <div
      {...rest}
      ref={dockRef}
      className={classes}
      data-il-component="fluid-glass-dock"
      data-il-tier={resolvedTier}
    >
      <span className="il-fluid-dock__glass" aria-hidden="true">
        <span className="il-fluid-dock__ambient" />
        <span className="il-fluid-dock__rim" />
      </span>
      <div className="il-fluid-dock__items">
        {items.map((item) => {
          const active = item.id === currentId;
          const content = (
            <>
              <span className="il-fluid-dock__glyph" aria-hidden="true">
                {item.label.slice(0, 1)}
              </span>
              <span className="il-fluid-dock__label">{item.label}</span>
            </>
          );
          const itemClass = [
            "il-fluid-dock__item",
            active ? "il-fluid-dock__item--active" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return item.href ? (
            <a
              key={item.id}
              href={item.href}
              className={itemClass}
              aria-current={active ? "page" : undefined}
              onClick={() => handleSelect(item.id)}
            >
              {content}
            </a>
          ) : (
            <button
              key={item.id}
              type="button"
              className={itemClass}
              aria-pressed={active}
              onClick={() => handleSelect(item.id)}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
