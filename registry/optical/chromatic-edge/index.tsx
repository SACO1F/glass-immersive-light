"use client";

import { forwardRef, useCallback, useEffect, useId, useRef } from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type ChromaticEdgeTier = "auto" | "high" | "mid" | "low";

export interface ChromaticEdgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tier?: ChromaticEdgeTier;
  intensity?: number;
  radius?: number;
  as?: "div" | "article" | "section";
}

type ChromaticStyle = React.CSSProperties & {
  "--il-chromatic-radius"?: string;
  "--il-chromatic-intensity"?: string;
};

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

export const ChromaticEdge = forwardRef<HTMLDivElement, ChromaticEdgeProps>(
  function ChromaticEdge(
    {
      tier = "auto",
      intensity = 0.85,
      radius = 26,
      as = "div",
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const uid = useId().replace(/:/g, "");
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;

        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    useAmbientLight(rootRef, 280);

    const safeIntensity = Number.isFinite(intensity)
      ? Math.min(1, Math.max(0, intensity))
      : 0.85;
    const safeRadius = Math.max(0, radius);
    const Component = as;
    const classes = ["il-chromatic-edge", className]
      .filter(Boolean)
      .join(" ");
    const mergedStyle: ChromaticStyle = {
      "--il-chromatic-radius": `${safeRadius}px`,
      "--il-chromatic-intensity": `${safeIntensity}`,
      ...(style as ChromaticStyle),
    };

    const resolvedTier = useOpticalTier(rootRef, tier);

    return (
      <Component
        {...rest}
        ref={setRef}
        className={classes}
        style={mergedStyle}
        data-il-component="chromatic-edge"
        data-il-tier={resolvedTier}
      >
        <span className="il-chromatic-edge__frame" aria-hidden="true">
          <svg
            className="il-chromatic-edge__svg"
            width="100%"
            height="100%"
          >
          <defs>
            <linearGradient
              id={`${uid}-gradient`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ff7a9c" />
              <stop offset="45%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#5be7ff" />
            </linearGradient>
            <filter
              id={`${uid}-filter`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.02"
                numOctaves="1"
                seed="9"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={safeRadius}
            ry={safeRadius}
            fill="none"
            stroke={`url(#${uid}-gradient)`}
            strokeWidth="2"
            strokeOpacity={safeIntensity}
            filter={`url(#${uid}-filter)`}
          />
          </svg>
        </span>

        <span className="il-chromatic-edge__glow" aria-hidden="true" />
        <div className="il-chromatic-edge__content">{children}</div>
      </Component>
    );
  },
);

ChromaticEdge.displayName = "ChromaticEdge";
