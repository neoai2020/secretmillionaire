import { brand } from "./brand.config";
import { PARTNER_LINK_PLACEHOLDER } from "./offers.config";

export const ONBOARDING_PRODUCT_NAME = brand.productName;

export const ONBOARDING_BETA_QUALIFICATION_CTA_URL = PARTNER_LINK_PLACEHOLDER;

export const ONBOARDING_DASHBOARD_ROUTE = "/dashboard";

export const ONBOARDING_META_KEY = "onboarding_completed" as const;

export const onboardingContent = {
  welcome: {
    title: "Welcome, Initiate",
    body: "Your private extraction terminal is ready. You now have access to the same data streams used by elite wealth managers — simplified into three clicks.",
    continueCta: "Enter Command Center",
  },
  preparing: {
    title: "Establishing secure connection",
    rows: [
      {
        label: "Initiate credentials verified",
        description: "Your membership has been authenticated on the private network.",
      },
      {
        label: "Private server allocation confirmed",
        description: "A dedicated extraction node has been reserved for your account.",
      },
      {
        label: "Extraction terminal unlocked",
        description: "Connect → Scan → Extract is now available in your Command Center.",
      },
    ],
    tip: "Complete all three clicks in order. The system will guide you at each step.",
    continueCta: "Continue",
  },
  partnerOffer: {
    enabled: true,
    badge: "OPTIONAL PARTNER OFFER",
    headline: "Exclusive Partner Opportunity",
    subcopy: `This is separate from your ${ONBOARDING_PRODUCT_NAME} membership — completely optional.`,
    infoCard: "An optional partner program you can explore at your own pace.",
    payLabel: "Potential earnings",
    payAmount: "Varies",
    cta: "Learn More >",
    qualification: {
      badge: "QUICK CHECK",
      headline: "Interested in the partner offer?",
      requirements: [
        "A phone or computer",
        "Speaks English",
        "No tech skills required",
      ],
      footer: "If this isn't for you — skip and go straight to your dashboard.",
      primaryCta: "View Partner Offer >",
      noThanksCta: "No thanks, go to dashboard →",
      finePrint: `Optional partner offer, separate from ${ONBOARDING_PRODUCT_NAME}.`,
    },
  },
} as const;
