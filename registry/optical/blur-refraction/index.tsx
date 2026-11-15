"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type BlurRefractionTier = "auto" | "high" | "mid" | "low";
export type BlurRefractionTint = "clear" | "frosted" | "tinted";

export interface BlurRefractionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tier?: BlurRefractionTier;
  blur?: number;
  tint?: BlurRefractionTint;
  radius?: number;
  as?: "div" | "article" | "section";
}

type BlurStyle = React.CSSProperties & {
  "--il-glass-blur-raw"?: string;
  "--il-glass-radius"?: string;
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

export const BlurRefraction = forwardRef<
  HTMLDivElement,
  BlurRefractionProps
>(function BlurRefraction(
  {
    tier = "auto",
    blur = 16,
    tint = "frosted",
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
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;

      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useAmbientLight(rootRef, 300);

  const safeBlur = Number.isFinite(blur) ? Math.max(0, blur) : 16;
  const Component = as;
  const classes = [
    "il-blur-refraction",
    `il-blur-refraction--${tint}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const mergedStyle: BlurStyle = {
    "--il-glass-blur-raw": `${safeBlur}px`,
    "--il-glass-radius": `${Math.max(0, radius)}px`,
    ...(style as BlurStyle),
  };

  const resolvedTier = useOpticalTier(rootRef, tier);

  return (
    <Component
      {...rest}
      ref={setRef}
      className={classes}
      style={mergedStyle}
      data-il-component="blur-refraction"
      data-il-tier={resolvedTier}
    >
      <span className="il-blur-refraction__surface" aria-hidden="true">
        <span className="il-blur-refraction__ambient" />
        <span className="il-blur-refraction__rim" />
      </span>
      <div className="il-blur-refraction__content">{children}</div>
    </Component>
  );
});

BlurRefraction.displayName = "BlurRefraction";
