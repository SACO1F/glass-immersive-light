import { meta as ambientLightMeta } from "@/registry/optical/ambient-light/meta";
import { meta as blurRefractionMeta } from "@/registry/optical/blur-refraction/meta";
import { meta as chromaticEdgeMeta } from "@/registry/optical/chromatic-edge/meta";
import { meta as innerShadeMeta } from "@/registry/optical/inner-shade/meta";
import { meta as rimLightMeta } from "@/registry/optical/rim-light/meta";
import { meta as fluidGlassDockMeta } from "@/registry/scene/fluid-glass-dock/meta";
import { meta as immersiveModalMeta } from "@/registry/scene/immersive-modal/meta";
import { meta as opticalNavbarMeta } from "@/registry/scene/optical-navbar/meta";
import { meta as refractiveCardMeta } from "@/registry/scene/refractive-card/meta";
import { meta as sheenButtonMeta } from "@/registry/scene/sheen-button/meta";
import { meta as cursorRefractionCardMeta } from "@/registry/signature/cursor-refraction-card/meta";
import { meta as focusPulseFormMeta } from "@/registry/signature/focus-pulse-form/meta";
import { meta as glassHeroMeta } from "@/registry/signature/liquid-glass-hero/meta";
import { meta as liquidLightPoolMeta } from "@/registry/signature/liquid-light-pool/meta";
import { meta as magneticSheenButtonMeta } from "@/registry/signature/magnetic-sheen-button/meta";
import { meta as ripplePoolMeta } from "@/registry/signature/ripple-pool/meta";
import { componentMetaSchema, type ComponentMeta } from "./schema";

/**
 * MVP catalog. As the registry grows, replace this explicit list with a
 * generated index while keeping meta.ts as the single source of truth.
 */
const registry: ComponentMeta[] = [
  rimLightMeta,
  innerShadeMeta,
  blurRefractionMeta,
  chromaticEdgeMeta,
  ambientLightMeta,
  opticalNavbarMeta,
  fluidGlassDockMeta,
  refractiveCardMeta,
  sheenButtonMeta,
  immersiveModalMeta,
  cursorRefractionCardMeta,
  magneticSheenButtonMeta,
  focusPulseFormMeta,
  liquidLightPoolMeta,
  ripplePoolMeta,
  glassHeroMeta,
].map((meta) => componentMetaSchema.parse(meta));

export function getAllComponentMeta(): ComponentMeta[] {
  return registry;
}

export function getComponentMeta(slug: string): ComponentMeta | undefined {
  return registry.find((item) => item.slug === slug);
}
