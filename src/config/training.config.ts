import { brand } from "./brand.config";
import { PARTNER_LINK_PLACEHOLDER } from "./offers.config";

/** Page shell metadata; body copy lives in `training-content.ts`. */
export const trainingContent = {
  pageTitle: "Member Training",
  pageSubtitle: `Vault protocols and extraction walkthroughs for ${brand.productName} Initiates`,
  externalTrainingUrl: PARTNER_LINK_PLACEHOLDER,
  videos: [] as { id: string; title: string; description: string }[],
} as const;

export { trainingContentData } from "./training-content";
