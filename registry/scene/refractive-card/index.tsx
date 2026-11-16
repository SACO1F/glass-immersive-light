"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";
import "./styles.css";
import {
  useOpticalMaterial,
  useOpticalTier,
  type OpticalMaterialPreference,
} from "./use-optical-tier";

export type RefractiveCardTier = "auto" | "high" | "mid" | "low";

export type RefractiveCardVariant = "clear" | "frosted" | "tinted";

export interface RefractiveCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tier?: RefractiveCardTier;
  material?: OpticalMaterialPreference;
  intensity?: number;
  blur?: number;
  tilt?: boolean;
  variant?: RefractiveCardVariant;
  as?: "div" | "article" | "section";
}

type CardStyle = React.CSSProperties & {
  "--il-card-blur-raw"?: string;
  "--il-card-intensity"?: string;
};

/**
 * Tracks the pointer as an ambient light source even when it is outside the
 * component. Coordinates are relative to the element and may be negative.
 */
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

export const RefractiveCard = forwardRef<
  HTMLDivElement,
  RefractiveCardProps
>(function RefractiveCard(
  {
    tier = "auto",
    material: materialPreference = "auto",
    intensity = 0.6,
    blur = 14,
    tilt = true,
    variant = "frosted",
    as = "div",
    className,
    style,
    children,
    onPointerMove,
    onPointerLeave,
    ...rest
  },
  ref,
) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const setCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      cardRef.current = node;

      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useAmbientLight(cardRef, 320);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reset = () => {
      if (!motion.matches) return;
      element.style.setProperty("--il-card-rx", "0deg");
      element.style.setProperty("--il-card-ry", "0deg");
    };

    reset();
    motion.addEventListener("change", reset);

    return () => motion.removeEventListener("change", reset);
  }, []);

  const safeIntensity = Number.isFinite(intensity)
    ? Math.min(1, Math.max(0, intensity))
    : 0.6;
  const safeBlur = Number.isFinite(blur) ? Math.max(0, blur) : 14;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    onPointerMove?.(event);

    if (
      event.defaultPrevented ||
      event.pointerType !== "mouse" ||
      !tilt ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      element.style.setProperty("--il-card-rx", `${(y - 50) * -0.08}deg`);
      element.style.setProperty("--il-card-ry", `${(x - 50) * 0.08}deg`);
    });
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    onPointerLeave?.(event);

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    element.style.setProperty("--il-card-rx", "0deg");
    element.style.setProperty("--il-card-ry", "0deg");
  };

  const Component = as;
  const resolvedTier = useOpticalTier(cardRef, tier);
  const resolvedMaterial = useOpticalMaterial(
    cardRef,
    materialPreference,
    "immersive-light",
  );
  const isLiquidGlass = resolvedMaterial === "liquid-glass";
  const classes = [
    "il-refractive-card",
    `il-refractive-card--${variant}`,
    isLiquidGlass ? "il-refractive-card--liquid-glass" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: CardStyle = {
    "--il-card-blur-raw": `${safeBlur}px`,
    "--il-card-intensity": `${safeIntensity}`,
    ...(style as CardStyle),
  };

  return (
    <Component
      {...rest}
      ref={setCardRef}
      className={classes}
      style={mergedStyle}
      data-il-component="refractive-card"
      data-il-tier={resolvedTier}
      data-il-material={resolvedMaterial}
      data-il-backend="css"
      data-il-dispersion="off"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {isLiquidGlass ? (
        <>
          <span className="il-refractive-card__glass" aria-hidden="true" />
          <span className="il-refractive-card__fresnel" aria-hidden="true" />
          <span className="il-refractive-card__specular" aria-hidden="true" />
        </>
      ) : (
        <span className="il-refractive-card__surface" aria-hidden="true">
          <span className="il-refractive-card__ambient" />
          <span className="il-refractive-card__specular" />
          <span className="il-refractive-card__rim" />
        </span>
      )}
      <div className="il-refractive-card__content">{children}</div>
    </Component>
  );
});

RefractiveCard.displayName = "RefractiveCard";
