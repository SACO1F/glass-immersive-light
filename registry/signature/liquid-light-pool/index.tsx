"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";
import {
  detectOpticalTier,
  readScopedTier,
} from "./use-optical-tier";

export type LiquidLightPoolTier = "auto" | "high" | "mid" | "low";
type ResolvedTier = "high" | "mid" | "low";

export interface LiquidLightPoolProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tier?: LiquidLightPoolTier;
  colorA?: string;
  colorB?: string;
  blobCount?: number;
  intensity?: number;
  interactive?: boolean;
}

type PoolStyle = React.CSSProperties & {
  "--il-pool-a"?: string;
  "--il-pool-b"?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string, fallback: [number, number, number]) {
  const normalized = hex.replace("#", "").trim();

  if (normalized.length === 3) {
    return [
      parseInt(normalized[0] + normalized[0], 16) / 255,
      parseInt(normalized[1] + normalized[1], 16) / 255,
      parseInt(normalized[2] + normalized[2], 16) / 255,
    ] as [number, number, number];
  }

  if (normalized.length === 6) {
    return [
      parseInt(normalized.slice(0, 2), 16) / 255,
      parseInt(normalized.slice(2, 4), 16) / 255,
      parseInt(normalized.slice(4, 6), 16) / 255,
    ] as [number, number, number];
  }

  return fallback;
}

function useResolvedTier(
  ref: React.RefObject<HTMLElement | null>,
  preference: LiquidLightPoolTier,
): { tier: ResolvedTier; reducedMotion: boolean } {
  const [tier, setTier] = useState<ResolvedTier>("mid");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resolveTier = () => {
      if (preference !== "auto") {
        setTier(preference);
        return;
      }

      setTier(readScopedTier(element) ?? detectOpticalTier());
    };

    const syncMotion = () => setReducedMotion(motion.matches);

    resolveTier();
    syncMotion();

    const observer = new MutationObserver(resolveTier);
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-tier"],
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-tier"],
    });

    if (typeof motion.addEventListener === "function") {
      motion.addEventListener("change", syncMotion);
    } else {
      motion.addListener(syncMotion);
    }

    return () => {
      observer.disconnect();

      if (typeof motion.removeEventListener === "function") {
        motion.removeEventListener("change", syncMotion);
      } else {
        motion.removeListener(syncMotion);
      }
    };
  }, [preference, ref]);

  return { tier, reducedMotion };
}

type PoolCanvasProps = {
  colorA: string;
  colorB: string;
  blobCount: number;
  intensity: number;
  interactive: boolean;
  onFail: () => void;
};

function LiquidLightPoolCanvas({
  colorA,
  colorB,
  blobCount,
  intensity,
  interactive,
  onFail,
}: PoolCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[LiquidLightPool] WebGL context unavailable");
      }
      onFail();
      return;
    }

    const vertexSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;

      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec3 uBlobs[6];
      uniform vec2 uPointer;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uIntensity;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float blobField(vec2 p, vec3 blob) {
        vec2 d = p - blob.xy;
        return blob.z * blob.z / (dot(d, d) + 0.0001);
      }

      void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) /
          min(uResolution.x, uResolution.y);

        float field = blobField(p, uBlobs[0]);
        field += blobField(p, uBlobs[1]);
        field += blobField(p, uBlobs[2]);
        field += blobField(p, uBlobs[3]);
        field += blobField(p, uBlobs[4]);
        field += blobField(p, uBlobs[5]);

        float shape = smoothstep(0.92, 1.16, field);
        float rim = smoothstep(0.95, 1.02, field) *
          (1.0 - smoothstep(1.02, 1.32, field));
        vec2 lightDir = normalize(p - uPointer + vec2(0.0001));
        float sideLight = 0.5 + 0.5 *
          dot(lightDir, normalize(vec2(-0.45, 0.65)));
        float fresnel = rim * (0.35 + sideLight * 0.65);

        vec3 base = mix(
          uColorA,
          uColorB,
          smoothstep(-0.35, 0.45, p.x + p.y * 0.45)
        );
        float glow = smoothstep(0.12, 1.25, field);
        vec3 color = base;
        color += uColorB * fresnel * 0.55;
        color += uColorA * glow * 0.3;
        color += uColorA * (1.0 - shape) * 0.035;

        float alpha = shape * 0.92 + glow * 0.28;
        alpha *= uIntensity;

        float dither = (hash(gl_FragCoord.xy + uTime * 0.01) - 0.5) / 255.0;
        gl_FragColor = vec4(color + dither, clamp(alpha, 0.0, 1.0));
      }
    `;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[LiquidLightPool] shader compile failed",
            gl.getShaderInfoLog(shader),
          );
        }
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      onFail();
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      onFail();
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[LiquidLightPool] program link failed",
          gl.getProgramInfoLog(program),
        );
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      onFail();
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const blobsLocation = gl.getUniformLocation(program, "uBlobs[0]");
    const pointerLocation = gl.getUniformLocation(program, "uPointer");
    const colorALocation = gl.getUniformLocation(program, "uColorA");
    const colorBLocation = gl.getUniformLocation(program, "uColorB");
    const intensityLocation = gl.getUniformLocation(program, "uIntensity");

    gl.uniform3fv(colorALocation, hexToRgb(colorA, [0.43, 0.9, 1]));
    gl.uniform3fv(colorBLocation, hexToRgb(colorB, [1, 0.44, 0.61]));
    gl.uniform1f(intensityLocation, clamp(intensity, 0, 1));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const count = clamp(Math.round(blobCount), 3, 6);
    const blobs = Array.from({ length: count }, (_, index) => {
      const phase = (index / count) * Math.PI * 2;
      return {
        x: Math.cos(phase) * 0.22,
        y: Math.sin(phase) * 0.16,
        radius: 0.11 + (index % 3) * 0.018,
        phase,
        speed: 0.28 + index * 0.035,
        orbitX: 0.14 + (index % 2) * 0.06,
        orbitY: 0.1 + (index % 3) * 0.03,
      };
    });

    const pointer = { x: 0, y: 0, active: false, dragging: false };
    const visibleRef = { current: true };
    let frameId: number | null = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionLocation, width, height);
    };

    resize();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : null;
    resizeObserver?.observe(canvas);
    window.addEventListener("resize", resize);

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const minSide = Math.min(rect.width, rect.height) || 1;
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) *
        (rect.width / minSide) * 2;
      pointer.y = (0.5 - (event.clientY - rect.top) / rect.height) *
        (rect.height / minSide) * 2;
      pointer.active = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!interactive) return;
      updatePointer(event);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!interactive) return;
      pointer.dragging = true;
      updatePointer(event);
      canvas.setPointerCapture?.(event.pointerId);
    };

    const handlePointerUp = (event: PointerEvent) => {
      pointer.dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    };

    const handlePointerLeave = () => {
      if (!pointer.dragging) pointer.active = false;
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onFail();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    const visibilityObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              visibleRef.current = entry.isIntersecting;
            },
            { threshold: 0.05 },
          )
        : null;
    visibilityObserver?.observe(canvas);

    const blobData = new Float32Array(18);

    const draw = (now: number) => {
      frameId = requestAnimationFrame(draw);

      if (
        !visibleRef.current ||
        document.hidden ||
        width === 0 ||
        height === 0
      ) {
        return;
      }

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = now / 1000;

      for (let index = 0; index < count; index++) {
        const blob = blobs[index];
        const orbitX =
          Math.cos(time * blob.speed + blob.phase) * blob.orbitX;
        const orbitY =
          Math.sin(time * blob.speed * 0.85 + blob.phase) * blob.orbitY;

        let targetX = orbitX;
        let targetY = orbitY;

        if (pointer.active) {
          const weight = pointer.dragging ? 0.78 : 0.48;
          const spread = 0.16 + index * 0.015;
          targetX =
            orbitX * (1 - weight) +
            (pointer.x + Math.cos(blob.phase) * spread) * weight;
          targetY =
            orbitY * (1 - weight) +
            (pointer.y + Math.sin(blob.phase) * spread) * weight;
        }

        const ease = 1 - Math.pow(0.001, delta * (1.8 + index * 0.15));
        blob.x += (targetX - blob.x) * ease;
        blob.y += (targetY - blob.y) * ease;

        blobData[index * 3] = blob.x;
        blobData[index * 3 + 1] = blob.y;
        blobData[index * 3 + 2] = blob.radius;
      }

      for (let index = count; index < 6; index++) {
        blobData[index * 3] = 0;
        blobData[index * 3 + 1] = 0;
        blobData[index * 3 + 2] = 0;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(timeLocation, time);
      gl.uniform3fv(blobsLocation, blobData);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [blobCount, colorA, colorB, intensity, interactive, onFail]);

  return (
    <canvas
      ref={canvasRef}
      className="il-liquid-pool__canvas"
      aria-hidden="true"
    />
  );
}

function LiquidLightPoolFallback({
  colorA,
  colorB,
}: {
  colorA: string;
  colorB: string;
}) {
  return (
    <span className="il-liquid-pool__fallback" aria-hidden="true">
      <span
        className="il-liquid-pool__blob il-liquid-pool__blob--a"
        style={{ background: colorA }}
      />
      <span
        className="il-liquid-pool__blob il-liquid-pool__blob--b"
        style={{ background: colorB }}
      />
      <span
        className="il-liquid-pool__blob il-liquid-pool__blob--c"
        style={{ background: colorA }}
      />
    </span>
  );
}

export function LiquidLightPool({
  tier = "auto",
  colorA = "#6fe7ff",
  colorB = "#ff6f9c",
  blobCount = 5,
  intensity = 0.9,
  interactive = true,
  className,
  style,
  children,
  onPointerMove,
  ...rest
}: LiquidLightPoolProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const { tier: resolvedTier, reducedMotion } = useResolvedTier(
    rootRef,
    tier,
  );
  const showWebGL =
    resolvedTier === "high" && !reducedMotion && !webglFailed;
  const handleWebGLFail = useCallback(() => setWebglFailed(true), []);

  const handleFallbackPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (showWebGL || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--il-pool-pointer-x", `${x}`);
    event.currentTarget.style.setProperty("--il-pool-pointer-y", `${y}`);
  };

  const classes = ["il-liquid-pool", className]
    .filter(Boolean)
    .join(" ");
  const mergedStyle: PoolStyle = {
    "--il-pool-a": colorA,
    "--il-pool-b": colorB,
    ...(style as PoolStyle),
  };

  return (
    <div
      {...rest}
      ref={rootRef}
      className={classes}
      style={mergedStyle}
      data-il-component="liquid-light-pool"
      data-il-tier={resolvedTier}
      onPointerMove={handleFallbackPointer}
    >
      <span className="il-liquid-pool__surface" aria-hidden="true" />
      {showWebGL ? (
        <LiquidLightPoolCanvas
          colorA={colorA}
          colorB={colorB}
          blobCount={blobCount}
          intensity={intensity}
          interactive={interactive}
          onFail={handleWebGLFail}
        />
      ) : (
        <LiquidLightPoolFallback colorA={colorA} colorB={colorB} />
      )}

      {children ? (
        <div className="il-liquid-pool__content">{children}</div>
      ) : null}
    </div>
  );
}
