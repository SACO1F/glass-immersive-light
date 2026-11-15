"use client";

import { useEffect, useRef } from "react";

type Rgb = [number, number, number];

type Palette = {
  rgb: Rgb;
  alpha: number;
};

const palettes: Record<"dark" | "light", Palette[]> = {
  dark: [
    { rgb: [111, 231, 255], alpha: 0.32 },
    { rgb: [139, 123, 255], alpha: 0.28 },
    { rgb: [255, 111, 156], alpha: 0.22 },
    { rgb: [255, 208, 138], alpha: 0.15 },
  ],
  light: [
    { rgb: [0, 122, 153], alpha: 0.16 },
    { rgb: [90, 75, 208], alpha: 0.13 },
    { rgb: [189, 31, 92], alpha: 0.1 },
    { rgb: [143, 85, 0], alpha: 0.08 },
  ],
};

const orbs = [
  {
    x: 0.18,
    y: 0.12,
    radius: 0.46,
    color: 0,
    phase: 0.2,
    speed: 0.00007,
    depth: 0.5,
    direction: 1,
  },
  {
    x: 0.84,
    y: 0.2,
    radius: 0.38,
    color: 1,
    phase: 2.1,
    speed: 0.00009,
    depth: 0.85,
    direction: -1,
  },
  {
    x: 0.64,
    y: 0.78,
    radius: 0.5,
    color: 2,
    phase: 4.2,
    speed: 0.00006,
    depth: 1.2,
    direction: 1,
  },
  {
    x: 0.1,
    y: 0.72,
    radius: 0.34,
    color: 3,
    phase: 1.4,
    speed: 0.00011,
    depth: 1.6,
    direction: -1,
  },
  {
    x: 0.48,
    y: 0.46,
    radius: 0.28,
    color: 1,
    phase: 3.3,
    speed: 0.00008,
    depth: 0.9,
    direction: 1,
  },
];

function mixRgb(from: Rgb, to: Rgb, amount: number): string {
  const t = Math.min(1, Math.max(0, amount));
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);
  return `${r} ${g} ${b}`;
}

export function SiteBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    let width = 0;
    let height = 0;
    let theme: "dark" | "light" =
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    let frame = 0;
    let lastPaint = 0;
    let scrollDirty = false;
    let targetProgress = 0;
    let currentProgress = 0;
    let pointerX = 0.5;
    let pointerY = 0.38;
    let pointerTargetX = pointerX;
    let pointerTargetY = pointerY;
    let pointerActive = false;

    const readScroll = () => {
      const range = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      targetProgress = Math.min(1, Math.max(0, window.scrollY / range));
    };

    const paint = (time: number) => {
      context.clearRect(0, 0, width, height);

      const palette = palettes[theme];
      const reduce = reducedMotion.matches;
      const progress = currentProgress;
      const pointerEase =
        finePointer.matches && pointerActive && !reduce ? 1 : 0;
      const clock = reduce ? progress * 90000 : time;

      context.globalCompositeOperation =
        theme === "dark" ? "lighter" : "source-over";

      // A soft spectral band travels with the scroll position. It gives the
      // fixed backdrop a clear, readable change on long pages.
      const bandY = (0.06 + progress * 0.88) * height;
      const bandHeight = Math.max(180, height * 0.24);
      const band = context.createLinearGradient(
        0,
        bandY - bandHeight,
        0,
        bandY + bandHeight,
      );
      const bandRgb = theme === "dark" ? "139 123 255" : "90 75 208";
      const bandAlpha = theme === "dark" ? 0.12 : 0.07;

      band.addColorStop(0, `rgb(${bandRgb} / 0)`);
      band.addColorStop(0.5, `rgb(${bandRgb} / ${bandAlpha})`);
      band.addColorStop(1, `rgb(${bandRgb} / 0)`);
      context.fillStyle = band;
      context.fillRect(0, bandY - bandHeight, width, bandHeight * 2);

      for (const [index, orb] of orbs.entries()) {
        const driftX = Math.sin(clock * orb.speed + orb.phase) * 0.045;
        const driftY = Math.cos(clock * orb.speed * 0.82 + orb.phase) * 0.035;

        // Scroll parallax: alternate directions so the field opens up and
        // closes again instead of sliding away as one flat image.
        const wave = Math.sin(
          progress * Math.PI * 2 * (1.1 + index * 0.06) + orb.phase,
        );
        const scrollX =
          Math.cos(progress * Math.PI * 2 * 0.85 + orb.phase) *
          0.035 *
          orb.depth *
          orb.direction;
        const scrollY =
          wave * (0.09 + orb.depth * 0.055) * orb.direction;

        const x =
          (orb.x +
            driftX +
            scrollX +
            (pointerX - 0.5) * 0.16 * pointerEase * orb.depth) *
          width;
        const y =
          (orb.y +
            driftY +
            scrollY +
            (pointerY - 0.5) * 0.12 * pointerEase * orb.depth) *
          height;
        const radius = Math.max(width, height) * orb.radius;

        const base = palette[orb.color];
        // Keep the blend inside neighbouring spectral stops. Mixing the warm
        // stop straight into cyan reads as a muddy green at the page bottom.
        const next = palette[orb.color === 3 ? 2 : orb.color + 1];
        const colorShift = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2);
        const rgb = mixRgb(base.rgb, next.rgb, colorShift * 0.5);

        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgb(${rgb} / ${base.alpha})`);
        gradient.addColorStop(0.52, `rgb(${rgb} / ${base.alpha * 0.34})`);
        gradient.addColorStop(1, `rgb(${rgb} / 0)`);

        context.fillStyle = gradient;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }

      context.globalCompositeOperation = "source-over";

      const veil = context.createLinearGradient(0, 0, 0, height);
      veil.addColorStop(
        0,
        theme === "dark" ? "rgb(5 7 11 / 0)" : "rgb(242 244 241 / 0)",
      );
      veil.addColorStop(
        0.62,
        theme === "dark"
          ? "rgb(5 7 11 / 0.12)"
          : "rgb(242 244 241 / 0.18)",
      );
      veil.addColorStop(
        1,
        theme === "dark" ? "rgb(5 7 11 / 0.58)" : "rgb(242 244 241 / 0.5)",
      );
      context.fillStyle = veil;
      context.fillRect(0, 0, width, height);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      readScroll();
      paint(performance.now());
    };

    const tick = (now: number) => {
      if (scrollDirty) {
        readScroll();
        scrollDirty = false;
      }

      const delta = targetProgress - currentProgress;
      currentProgress += delta * 0.09;

      if (Math.abs(delta) < 0.0004) {
        currentProgress = targetProgress;
      }

      pointerX += (pointerTargetX - pointerX) * 0.075;
      pointerY += (pointerTargetY - pointerY) * 0.075;

      if (!document.hidden && now - lastPaint > 32) {
        lastPaint = now;
        paint(now);
      }

      frame = window.requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      scrollDirty = true;

      if (reducedMotion.matches) {
        readScroll();
        scrollDirty = false;
        currentProgress = targetProgress;
        paint(performance.now());
      }
    };

    const handlePointer = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;

      pointerActive = true;
      pointerTargetX = event.clientX / Math.max(1, window.innerWidth);
      pointerTargetY = event.clientY / Math.max(1, window.innerHeight);
    };

    const handleLeave = () => {
      pointerActive = false;
    };

    const handleVisibility = () => {
      readScroll();
      if (!document.hidden) paint(performance.now());
    };

    const observer = new MutationObserver(() => {
      theme =
        document.documentElement.dataset.theme === "light" ? "light" : "dark";
      paint(performance.now());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Route changes, font swaps and code tabs all alter document height.
    // Re-read the scroll range so the parallax stays tied to the real page.
    const heightObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            scrollDirty = true;

            if (reducedMotion.matches) {
              readScroll();
              currentProgress = targetProgress;
              paint(performance.now());
            }
          })
        : null;

    heightObserver?.observe(document.body);

    readScroll();
    currentProgress = targetProgress;
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("pointerleave", handleLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    if (!reducedMotion.matches) {
      frame = window.requestAnimationFrame(tick);
    }

    const handleMotionChange = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;

      if (reducedMotion.matches) {
        readScroll();
        currentProgress = targetProgress;
        pointerActive = false;
        pointerX = 0.5;
        pointerY = 0.38;
        paint(performance.now());
      } else {
        lastPaint = 0;
        scrollDirty = true;
        frame = window.requestAnimationFrame(tick);
      }
    };

    reducedMotion.addEventListener("change", handleMotionChange);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      heightObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <div className="site-backdrop" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
