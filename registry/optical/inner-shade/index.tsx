"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type InnerShadeTier = "auto" | "high" | "mid" | "low";

export interface InnerShadeProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: InnerShadeTier;
  depth?: number;
  radius?: number;
  as?: "div" | "article" | "section";
}

type InnerShadeStyle = React.CSSProperties & {
  "--il-inner-radius"?: string;
  "--il-inner-depth"?: string;
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

export const InnerShade = forwardRef<HTMLDivElement, InnerShadeProps>(
  function InnerShade(
    {
      tier = "auto",
      depth = 0.7,
      radius = 24,
      as = "div",
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;

        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    useAmbientLight(rootRef, 280);

    const safeDepth = Number.isFinite(depth)
      ? Math.min(1, Math.max(0, depth))
      : 0.7;

    const Component = as;
    const classes = ["il-inner-shade", className].filter(Boolean).join(" ");
    const mergedStyle: InnerShadeStyle = {
      "--il-inner-radius": `${Math.max(0, radius)}px`,
      "--il-inner-depth": `${safeDepth}`,
      ...(style as InnerShadeStyle),
    };

    const resolvedTier = useOpticalTier(rootRef, tier);

    return (
      <Component
        {...rest}
        ref={setRef}
        className={classes}
        style={mergedStyle}
        data-il-component="inner-shade"
        data-il-tier={resolvedTier}
      >
        <span className="il-inner-shade__light" aria-hidden="true" />
        <span className="il-inner-shade__shade" aria-hidden="true" />
        <div className="il-inner-shade__content">{children}</div>
      </Component>
    );
  },
);

InnerShade.displayName = "InnerShade";
