import { z } from "zod";

export const opticalTierSchema = z.enum(["high", "mid", "low"]);

const tierPreferenceSchema = z.enum(["auto", "high", "mid", "low"]);

export const opticalMaterialSchema = z.enum([
  "immersive-light",
  "liquid-glass",
]);

export const opticalBackendSchema = z.enum(["css", "svg", "webgl"]);

export const materialSupportSchema = z.object({
  id: opticalMaterialSchema,
  backends: z.array(opticalBackendSchema).min(1),
  fidelity: z.enum(["high", "medium", "low"]),
  gpu: z.enum(["low", "medium", "high"]),
  dispersion: z.enum(["off", "opt-in", "default"]),
  fallback: z.string().min(1),
});

export const propDocSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  default: z.string().optional(),
  description: z.string().min(1),
  required: z.boolean().optional(),
});

export const cssVariableDocSchema = z.object({
  name: z.string().min(1),
  default: z.string().min(1),
  description: z.string().min(1),
});

export const degradationRowSchema = z.object({
  tier: z.enum(["high", "mid", "low", "reduced-motion"]),
  behavior: z.string().min(1),
});

export const componentMetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  displayName: z.string().min(1),
  layer: z.enum(["optical", "scene", "signature"]),
  tech: z.enum(["css", "svg", "webgl", "css+svg"]),
  fidelity: z.enum(["high", "medium", "low"]),
  gpu: z.enum(["low", "medium", "high"]),
  priority: z.enum(["P0", "P1", "P2"]),
  summary: z.string().min(1),
  fallbackSummary: z.string().min(1),
  dependencies: z.array(z.string()).default([]),
  files: z.array(z.string()).min(1),
  tier: z.object({
    min: opticalTierSchema,
    default: tierPreferenceSchema,
  }),
  props: z.array(propDocSchema).default([]),
  cssVariables: z.array(cssVariableDocSchema).default([]),
  degradation: z.array(degradationRowSchema).min(1),
  a11y: z.array(z.string()).min(1),
  browserNotes: z.array(z.string()).default([]),
  materials: z.array(materialSupportSchema).optional(),
});

export type ComponentMeta = z.infer<typeof componentMetaSchema>;
export type OpticalMaterial = z.infer<typeof opticalMaterialSchema>;
export type OpticalBackend = z.infer<typeof opticalBackendSchema>;
export type MaterialSupport = z.infer<typeof materialSupportSchema>;
export type PropDoc = z.infer<typeof propDocSchema>;
export type CssVariableDoc = z.infer<typeof cssVariableDocSchema>;
export type DegradationRow = z.infer<typeof degradationRowSchema>;
