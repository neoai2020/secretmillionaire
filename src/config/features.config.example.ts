import type { FeatureId } from "./features.config";

/**
 * Example: enable all CashTap-style features.
 * Copy entries into enabledFeatures in features.config.ts
 */
export const cashtapFeatures: FeatureId[] = [
  "core-workflow",
  "training",
  "scale-upsell",
  "premium-dfy",
  "premium-instant",
  "premium-autopilot",
  "dopamine",
];
