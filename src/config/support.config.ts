import { SUPPORT_EMAIL } from "@/lib/support";

export const support = {
  email: SUPPORT_EMAIL,
  contactUrl: `mailto:${SUPPORT_EMAIL}`,
  helpCenterUrl: "",
  headline: "Contact Support",
  pageTitle: "Support",
  pageSubtitle: "Our support team is here for members — usually replies in under an hour",
  subcopy: "Stuck on a step? Email us and a real person will help you get unstuck.",
  ctaLabel: "Contact Support",
  stats: [
    { icon: "clock", label: "Avg response:", highlight: "under 1 hour", highlightClass: "text-[#45A29E]" },
    { icon: "shield", label: "Private support channel" },
    { icon: "star", label: "Priority member assistance" },
  ],
} as const;
