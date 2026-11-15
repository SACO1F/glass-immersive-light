"use client";

import { useEffect, useRef, useState } from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type RipplePoolTier = "auto" | "high" | "mid" | "low";

export interface RipplePoolProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tier?: RipplePoolTier;
  intensity?: number;
  color?: string;
  maxRipples?: number;
  label?: string;
}

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type RippleStyle = React.CSSProperties & {
  "--il-ripple-intensity"?: string;
  "--il-pool-color"?: string;
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

export function RipplePool({
  tier = "auto",
  intensity = 0.8,
  color,
  maxRipples = 6,
  label = "点击产生光池涟漪",
  className,
  style,
  children,
  onClick,
  onKeyDown,
  ...rest
}: RipplePoolProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useAmbientLight(rootRef, 320);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  const safeIntensity = Number.isFinite(intensity)
    ? Math.min(1, Math.max(0, intensity))
    : 0.8;
  const safeMax = Number.isFinite(maxRipples)
    ? Math.min(10, Math.max(1, Math.round(maxRipples)))
    : 6;

  const addRipple = (x: number, y: number) => {
    const id = ++idRef.current;
    setRipples((current) => [
      ...(safeMax > 1 ? current.slice(-(safeMax - 1)) : []),
      { id, x, y },
    ]);

    const timer = window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== id));
      timersRef.current = timersRef.current.filter(
        (item) => item !== timer,
      );
    }, 950);

    timersRef.current.push(timer);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const rect = event.currentTarget.getBoundingClientRect();
    addRipple(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100,
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      addRipple(50, 50);
    }
  };

  const classes = ["il-ripple-pool", className].filter(Boolean).join(" ");
  const mergedStyle: RippleStyle = {
    "--il-ripple-intensity": `${safeIntensity}`,
    ...(color ? { "--il-pool-color": color } : {}),
    ...(style as RippleStyle),
  };

  const resolvedTier = useOpticalTier(rootRef, tier);

  return (
    <div
      {...rest}
      ref={rootRef}
      className={classes}
      style={mergedStyle}
      role="button"
      tabIndex={0}
      aria-label={label}
      data-il-component="ripple-pool"
      data-il-tier={resolvedTier}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="il-ripple-pool__surface" aria-hidden="true" />
      <span className="il-ripple-pool__ambient" aria-hidden="true" />
      <span className="il-ripple-pool__ripples" aria-hidden="true">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="il-ripple-pool__ripple"
            style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
          />
        ))}
      </span>
      {children ? (
        <div className="il-ripple-pool__content">{children}</div>
      ) : null}
    </div>
  );
}
