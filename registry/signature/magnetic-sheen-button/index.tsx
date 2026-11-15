"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type MagneticSheenButtonTier = "auto" | "high" | "mid" | "low";

export interface MagneticSheenButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tier?: MagneticSheenButtonTier;
  intensity?: number;
  magnet?: number;
}

type MagneticStyle = React.CSSProperties & {
  "--il-button-intensity"?: string;
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

export const MagneticSheenButton = forwardRef<
  HTMLButtonElement,
  MagneticSheenButtonProps
>(function MagneticSheenButton(
  {
    tier = "auto",
    intensity = 0.8,
    magnet = 8,
    className,
    style,
    children,
    type = "button",
    onPointerMove,
    onPointerLeave,
    ...rest
  },
  ref,
) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;

      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useAmbientLight(buttonRef, 220);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reset = () => {
      if (!motion.matches) return;
      element.style.setProperty("--il-magnet-x", "0px");
      element.style.setProperty("--il-magnet-y", "0px");
    };

    reset();
    motion.addEventListener("change", reset);

    return () => motion.removeEventListener("change", reset);
  }, []);

  const safeIntensity = Number.isFinite(intensity)
    ? Math.min(1, Math.max(0, intensity))
    : 0.8;
  const safeMagnet = Number.isFinite(magnet) ? Math.max(0, magnet) : 8;

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const element = event.currentTarget;
    onPointerMove?.(event);

    if (
      event.defaultPrevented ||
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      element.style.setProperty("--il-magnet-x", `${x * safeMagnet}px`);
      element.style.setProperty("--il-magnet-y", `${y * safeMagnet}px`);
    });
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    event.currentTarget.style.setProperty("--il-magnet-x", "0px");
    event.currentTarget.style.setProperty("--il-magnet-y", "0px");
  };

  const classes = ["il-magnetic-button", className].filter(Boolean).join(" ");
  const mergedStyle: MagneticStyle = {
    "--il-button-intensity": `${safeIntensity}`,
    ...(style as MagneticStyle),
  };

  const resolvedTier = useOpticalTier(buttonRef, tier);

  return (
    <button
      {...rest}
      ref={setRef}
      type={type}
      className={classes}
      style={mergedStyle}
      data-il-component="magnetic-sheen-button"
      data-il-tier={resolvedTier}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="il-magnetic-button__layers" aria-hidden="true">
        <span className="il-magnetic-button__ambient" />
        <span className="il-magnetic-button__specular" />
        <span className="il-magnetic-button__rim" />
      </span>
      <span className="il-magnetic-button__label">{children}</span>
    </button>
  );
});

MagneticSheenButton.displayName = "MagneticSheenButton";
