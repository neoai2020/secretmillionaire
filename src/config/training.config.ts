import { brand } from "./brand.config";

export const trainingContent = {
  pageTitle: "Member Training",
  pageSubtitle: `Vault protocols and extraction walkthroughs for ${brand.productName} Initiates`,
  externalTrainingUrl: "https://example.com/sms-training",
  videos: [] as { id: string; title: string; description: string }[],
} as const;
