import { FREE_TRAINING_URL } from "@/lib/support";

/** Vimeo embed URL with uploader/channel chrome hidden (no byline, portrait, or title). */
export function vimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0`;
}

/** Page shell metadata; body copy lives in `training-content.ts`. */
export const trainingContent = {
  pageTitle: "Training",
  pageSubtitle: "Video tutorials and frequently asked questions",
  externalTrainingUrl: FREE_TRAINING_URL,
  videos: [
    {
      id: "1209908982",
      title: "Welcome & Getting Started",
      description:
        "Start here — a quick intro to how the platform works and what to do first as a member.",
    },
    {
      id: "1209909366",
      title: "Build Your Website",
      description:
        "Step-by-step walkthrough for building your website, adding product links, and getting it live.",
    },
    {
      id: "1209920923",
      title: "Premium Features",
      description:
        "Walkthrough of Society Access premium tools — what they do and how to use them.",
    },
  ] as { id: string; title: string; description: string }[],
} as const;

export { trainingContentData } from "./training-content";
