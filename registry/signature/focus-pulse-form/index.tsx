"use client";

import { useCallback, useEffect, useRef } from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type FocusPulseFormTier = "auto" | "high" | "mid" | "low";

export interface FocusPulseFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  tier?: FocusPulseFormTier;
  intensity?: number;
}

type FormStyle = React.CSSProperties & {
  "--il-form-intensity"?: string;
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

export function FocusPulseForm({
  tier = "auto",
  intensity = 0.8,
  className,
  style,
  children,
  ...rest
}: FocusPulseFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const setRef = useCallback((node: HTMLFormElement | null) => {
    formRef.current = node;
  }, []);

  useAmbientLight(formRef, 300);

  const safeIntensity = Number.isFinite(intensity)
    ? Math.min(1, Math.max(0, intensity))
    : 0.8;
  const classes = ["il-focus-pulse-form", className]
    .filter(Boolean)
    .join(" ");
  const mergedStyle: FormStyle = {
    "--il-form-intensity": `${safeIntensity}`,
    ...(style as FormStyle),
  };

  const resolvedTier = useOpticalTier(formRef, tier);

  return (
    <form
      {...rest}
      ref={setRef}
      className={classes}
      style={mergedStyle}
      data-il-component="focus-pulse-form"
      data-il-tier={resolvedTier}
    >
      <span className="il-focus-pulse-form__ambient" aria-hidden="true" />
      <div className="il-focus-pulse-form__fields">{children}</div>
    </form>
  );
}
