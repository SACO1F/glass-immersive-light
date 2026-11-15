import type { OpticalTier } from "./types";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
  };
};

let webgl2Support: boolean | null = null;

function supportsWebGL2(): boolean {
  if (webgl2Support !== null) return webgl2Support;

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
 * Capability detection only. Motion preferences are handled per component
 * with CSS media queries, so a high-end device with reduced motion still
 * keeps its visual quality.
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

    const nav = navigator as NavigatorWithHints;
    if (nav.connection?.saveData) return "low";

    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 8;

    if (cores <= 4 || memory <= 4) return "low";

    const coarsePointer = media?.("(pointer: coarse)").matches ?? false;
    const dpr = window.devicePixelRatio || 1;

    if (
      coarsePointer ||
      cores < 8 ||
      memory < 8 ||
      dpr > 2 ||
      !supportsWebGL2()
    ) {
      return "mid";
    }

    return "high";
  } catch {
    return "mid";
  }
}
