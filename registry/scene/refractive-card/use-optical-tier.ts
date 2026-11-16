"use client";

import { useEffect, useState } from "react";

export type OpticalTier = "high" | "mid" | "low";
export type OpticalTierPreference = "auto" | OpticalTier;

let webgl2Support: boolean | null = null;

function supportsWebGL2(): boolean {
  if (webgl2Support === true) return true;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    webgl2Support = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2Support = false;
  }

  return webgl2Support;
}

/**
 * Minimal local capability detection for standalone copies.
 * Site usage normally resolves through the nearest [data-tier] scope.
 */
export function detectOpticalTier(): OpticalTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "mid";
  }

  try {
    const media = window.matchMedia;
    const reducedTransparency =
      media?.("(prefers-reduced-transparency: reduce)").matches ?? false;

    if (reducedTransparency) return "low";

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };

    if (nav.connection?.saveData) return "low";

    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 8;

    if (cores <= 4 || memory <= 4) return "low";

    if (
      (media?.("(pointer: coarse)").matches ?? false) ||
      cores < 8 ||
      memory < 8 ||
      (window.devicePixelRatio || 1) > 2 ||
      !supportsWebGL2()
    ) {
      return "mid";
    }

    return "high";
  } catch {
    return "mid";
  }
}

export function readScopedTier(element: Element | null): OpticalTier | null {
  const value = element?.closest("[data-tier]")?.getAttribute("data-tier");

  return value === "high" || value === "mid" || value === "low" ? value : null;
}

function listen(query: MediaQueryList | undefined, update: () => void) {
  if (!query) return;

  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", update);
  } else {
    query.addListener(update);
  }
}

function unlisten(query: MediaQueryList | undefined, update: () => void) {
  if (!query) return;

  if (typeof query.removeEventListener === "function") {
    query.removeEventListener("change", update);
  } else {
    query.removeListener(update);
  }
}

/**
 * Resolution order: explicit prop → nearest [data-tier] ancestor → local
 * capability detection. Components write the returned value to
 * data-il-tier so CSS resolves the same scope as JavaScript.
 *
 * Attach the ref to the component root before the first effect runs.
 */
export function useOpticalTier<T extends Element>(
  ref: React.RefObject<T | null>,
  preference: OpticalTierPreference = "auto",
): OpticalTier {
  const [tier, setTier] = useState<OpticalTier>(
    preference === "auto" ? "mid" : preference,
  );

  useEffect(() => {
    if (preference !== "auto") {
      setTier(preference);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const update = () => {
      setTier(readScopedTier(element) ?? detectOpticalTier());
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-tier"],
    });

    const coarse = window.matchMedia?.("(pointer: coarse)");
    const transparency = window.matchMedia?.(
      "(prefers-reduced-transparency: reduce)",
    );

    listen(coarse, update);
    listen(transparency, update);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      unlisten(coarse, update);
      unlisten(transparency, update);
      window.removeEventListener("resize", update);
    };
  }, [preference, ref]);

  return tier;
}

export type OpticalMaterial = "immersive-light" | "liquid-glass";
export type OpticalMaterialPreference = OpticalMaterial | "auto";

export function readScopedMaterial(
  element: Element | null,
): OpticalMaterial | null {
  // The component writes data-il-material on its own root, so only ancestors
  // are valid input scopes. Reading self would freeze the resolved value.
  const value = element?.parentElement?.closest("[data-il-material]")
    ?.getAttribute("data-il-material");

  return value === "immersive-light" || value === "liquid-glass"
    ? value
    : null;
}

/**
 * Resolve the optical material without changing layout or tier semantics.
 * Explicit prop wins, then the nearest ancestor scope, then the fallback.
 */
export function useOpticalMaterial<T extends Element>(
  ref: React.RefObject<T | null>,
  preference: OpticalMaterialPreference = "auto",
  fallback: OpticalMaterial = "immersive-light",
): OpticalMaterial {
  const [material, setMaterial] = useState<OpticalMaterial>(
    preference === "auto" ? fallback : preference,
  );

  useEffect(() => {
    if (preference !== "auto") {
      setMaterial(preference);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const update = () => {
      setMaterial(readScopedMaterial(element) ?? fallback);
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-il-material"],
    });

    return () => observer.disconnect();
  }, [fallback, preference, ref]);

  return material;
}
