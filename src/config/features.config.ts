export const FEATURE_IDS = [
  "extraction-workflow",
  "blog-builder",
  "core-workflow",
  "training",
  "scale-upsell",
  "premium-dfy",
  "premium-instant",
  "premium-autopilot",
  "dopamine",
] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];

export const enabledFeatures: FeatureId[] = [
  "extraction-workflow",
  "blog-builder",
  "training",
  "dopamine",
];

export function isFeatureEnabled(id: FeatureId): boolean {
  return enabledFeatures.includes(id);
}

export function requireFeature(id: FeatureId): boolean {
  return isFeatureEnabled(id);
}
