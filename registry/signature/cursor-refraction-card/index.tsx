"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type CursorRefractionCardTier = "auto" | "high" | "mid" | "low";

export interface CursorRefractionCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  backgroundSrc?: string;
  background?: string;
  displacement?: number;
  blur?: number;
  radius?: number;
  tier?: CursorRefractionCardTier;
  as?: "div" | "article" | "section";
}

type RefractionStyle = React.CSSProperties & {
  "--il-cursor-card-radius"?: string;
  "--il-cursor-card-blur"?: string;
};

const defaultBackground =
  "linear-gradient(135deg, #12202c 0%, #0b6e9c 48%, #ff7a9c 120%)";

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

export const CursorRefractionCard = forwardRef<
  HTMLDivElement,
  CursorRefractionCardProps
>(function CursorRefractionCard(
  {
    backgroundSrc,
    background,
    displacement = 10,
    blur = 2,
    radius = 28,
    tier = "auto",
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const uid = useId().replace(/:/g, "");

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;

      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useAmbientLight(rootRef, 320);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reset = () => {
      if (!motion.matches) return;
      element.style.setProperty("--il-refract-x", "0px");
      element.style.setProperty("--il-refract-y", "0px");
    };

    reset();
    motion.addEventListener("change", reset);

    return () => motion.removeEventListener("change", reset);
  }, []);

  const safeBlur = Number.isFinite(blur) ? Math.max(0, blur) : 2;
  const safeDisplacement = Number.isFinite(displacement)
    ? Math.min(24, Math.max(0, displacement))
    : 10;
  const safeRadius = Math.max(0, radius);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
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
      element.style.setProperty("--il-refract-x", `${x * 8}px`);
      element.style.setProperty("--il-refract-y", `${y * 6}px`);
    });
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    event.currentTarget.style.setProperty("--il-refract-x", "0px");
    event.currentTarget.style.setProperty("--il-refract-y", "0px");
  };

  const Component = as;
  const classes = ["il-cursor-refraction-card", className]
    .filter(Boolean)
    .join(" ");
  const mergedStyle: RefractionStyle = {
    "--il-cursor-card-radius": `${safeRadius}px`,
    "--il-cursor-card-blur": `${safeBlur}px`,
    ...(style as RefractionStyle),
  };

  const resolvedTier = useOpticalTier(rootRef, tier);

  return (
    <Component
      {...rest}
      ref={setRef}
      className={classes}
      style={mergedStyle}
      data-il-component="cursor-refraction-card"
      data-il-tier={resolvedTier}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <svg
        className="il-cursor-refraction-card__defs"
        aria-hidden="true"
        width="0"
        height="0"
      >
        <defs>
          <filter
            id={`${uid}-filter`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.012"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur
              in="noise"
              stdDeviation="1.2"
              result="softNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="softNoise"
              scale={safeDisplacement}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <span className="il-cursor-refraction-card__surface" aria-hidden="true">
        <span
          className="il-cursor-refraction-card__backdrop"
          style={{
            backgroundImage: backgroundSrc
              ? `url("${backgroundSrc}"), linear-gradient(135deg, #12202c, #0b6e9c 55%, #ff7a9c 120%)`
              : (background ?? defaultBackground),
            filter: `blur(${safeBlur}px) url(#${uid}-filter)`,
          }}
        />
        <span className="il-cursor-refraction-card__tint" />
        <span className="il-cursor-refraction-card__scrim" />
        <span className="il-cursor-refraction-card__ambient" />
        <span className="il-cursor-refraction-card__specular" />
        <span className="il-cursor-refraction-card__rim" />
      </span>

      <div className="il-cursor-refraction-card__content">{children}</div>
    </Component>
  );
});

CursorRefractionCard.displayName = "CursorRefractionCard";
