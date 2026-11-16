"use client";

import { useEffect, useRef, useState } from "react";
import "./styles.css";
import {
  createLiquidGlassRuntime,
  type LiquidGlassRuntime,
} from "./liquid-glass-runtime";
import {
  useOpticalTier,
  type OpticalTierPreference,
} from "./use-optical-tier";

export type GlassHeroBackend = "auto" | "webgl" | "css";

export type GlassHeroMaterial = "liquid-glass";

export type GlassHeroStatus = "idle" | "loading" | "ready" | "fallback";

export interface GlassHeroProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tier?: OpticalTierPreference;
  backend?: GlassHeroBackend;
  material?: GlassHeroMaterial;
  refraction?: number;
  dispersion?: number;
  fresnel?: number;
  radius?: number;
  backgroundSrc?: string;
  paused?: boolean;
  onBackendChange?: (backend: "webgl" | "css") => void;
}

function readTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function readMotionPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readTransparencyPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
}

function readContrastPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: more)").matches;
}

export function GlassHero({
  tier = "auto",
  backend = "auto",
  material = "liquid-glass",
  refraction = 0.35,
  dispersion = 0,
  fresnel = 0.7,
  radius = 28,
  backgroundSrc,
  paused = false,
  onBackendChange,
  className,
  style,
  children,
  onPointerMove,
  onPointerLeave,
  ...rest
}: GlassHeroProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<LiquidGlassRuntime | null>(null);
  const onBackendChangeRef = useRef(onBackendChange);
  const optionsRef = useRef({ refraction, dispersion, fresnel });

  const [resolvedBackend, setResolvedBackend] = useState<"css" | "webgl">(
    "css",
  );
  const [status, setStatus] = useState<GlassHeroStatus>("idle");
  const [fallbackReason, setFallbackReason] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeReady, setThemeReady] = useState(false);
  const [motionReduced, setMotionReduced] = useState(readMotionPreference);
  const [transparencyReduced, setTransparencyReduced] = useState(
    readTransparencyPreference,
  );
  const [contrastMore, setContrastMore] = useState(readContrastPreference);
  const [scene, setScene] = useState<TexImageSource | null>(null);

  const resolvedTier = useOpticalTier(rootRef, tier);

  onBackendChangeRef.current = onBackendChange;
  optionsRef.current = { refraction, dispersion, fresnel };

  useEffect(() => {
    const sync = () => setTheme(readTheme());

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Attach first, then read: the theme-init script can run between the
    // initial render and this effect.
    sync();
    setThemeReady(true);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const transparency = window.matchMedia(
      "(prefers-reduced-transparency: reduce)",
    );
    const contrast = window.matchMedia("(prefers-contrast: more)");
    const sync = () => {
      setMotionReduced(motion.matches);
      setTransparencyReduced(transparency.matches);
      setContrastMore(contrast.matches);
    };

    sync();
    motion.addEventListener("change", sync);
    transparency.addEventListener("change", sync);
    contrast.addEventListener("change", sync);

    return () => {
      motion.removeEventListener("change", sync);
      transparency.removeEventListener("change", sync);
      contrast.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    setScene(null);
    if (!backgroundSrc) return;

    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      if (!cancelled) setScene(image);
    };
    image.onerror = () => {
      if (!cancelled) setScene(null);
    };
    image.src = backgroundSrc;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [backgroundSrc]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const sceneReady = !backgroundSrc || scene !== null;
    const wantsWebGL =
      themeReady &&
      backend !== "css" &&
      !motionReduced &&
      !transparencyReduced &&
      !contrastMore &&
      sceneReady &&
      (backend === "webgl" || resolvedTier === "high");

    if (!wantsWebGL) {
      runtimeRef.current?.destroy();
      runtimeRef.current = null;
      setResolvedBackend("css");
      setStatus("idle");
      setFallbackReason("");
      onBackendChangeRef.current?.("css");
      return;
    }

    setStatus("loading");
    setResolvedBackend("css");

    const runtime = createLiquidGlassRuntime({
      canvas,
      scene,
      theme,
      radius,
      ...optionsRef.current,
      tint: theme === "light" ? [0.72, 0.9, 0.95] : [0.14, 0.2, 0.28],
      tintStrength: theme === "light" ? 0.12 : 0.05,
      fresnelColor: theme === "light" ? [0.21, 0.63, 0.75] : [0.72, 0.95, 1],
      onFallback: (reason) => {
        setResolvedBackend("css");
        setStatus("fallback");
        setFallbackReason(reason);
        onBackendChangeRef.current?.("css");
      },
    });

    if (!runtime) {
      setStatus("fallback");
      setFallbackReason("runtime-unavailable");
      onBackendChangeRef.current?.("css");
      return;
    }

    runtimeRef.current = runtime;
    runtime.resize();
    setResolvedBackend("webgl");
    setStatus("ready");
    setFallbackReason("");
    onBackendChangeRef.current?.("webgl");

    const observer = new ResizeObserver(() => runtime.resize());
    observer.observe(root);

    return () => {
      observer.disconnect();
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, [
    themeReady,
    backend,
    resolvedTier,
    motionReduced,
    transparencyReduced,
    contrastMore,
    backgroundSrc,
    scene,
    theme,
    radius,
  ]);

  useEffect(() => {
    runtimeRef.current?.setOptions(optionsRef.current);
  }, [refraction, dispersion, fresnel]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);

    if (
      event.pointerType !== "mouse" ||
      paused ||
      motionReduced ||
      !runtimeRef.current
    ) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    runtimeRef.current.setPointer(
      (event.clientX - rect.left) / Math.max(1, rect.width),
      (event.clientY - rect.top) / Math.max(1, rect.height),
    );
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    runtimeRef.current?.setPointer(0.5, 0.5);
  };

  const classes = ["il-glass-hero", className].filter(Boolean).join(" ");
  const mergedStyle = {
    "--il-hero-radius": `${Math.max(0, radius)}px`,
    ...style,
  } as React.CSSProperties;

  const sceneStyle = backgroundSrc
    ? { backgroundImage: `url("${backgroundSrc}")` }
    : undefined;

  return (
    <div
      {...rest}
      ref={rootRef}
      className={classes}
      style={mergedStyle}
      data-il-component="liquid-glass-hero"
      data-il-material={material}
      data-il-backend={resolvedBackend}
      data-il-tint={theme === "light" ? "cool" : "neutral"}
      data-il-dispersion={
        resolvedBackend === "webgl" && dispersion > 0 ? "on" : "off"
      }
      data-il-webgl-status={status}
      data-il-webgl-reason={fallbackReason || undefined}
      data-il-tier={resolvedTier}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className={[
          "il-glass-hero__scene",
          backgroundSrc ? "il-glass-hero__scene--image" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={sceneStyle}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className="il-glass-hero__canvas"
        aria-hidden="true"
      />
      <span className="il-glass-hero__fallback-glass" aria-hidden="true" />
      <span className="il-glass-hero__scrim" aria-hidden="true" />
      <div className="il-glass-hero__content">{children}</div>
    </div>
  );
}

GlassHero.displayName = "GlassHero";
