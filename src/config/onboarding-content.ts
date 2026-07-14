import { brand } from "./brand.config";
import { PARTNER_LINK_PLACEHOLDER } from "./offers.config";

export const ONBOARDING_PRODUCT_NAME = brand.productName;

export const ONBOARDING_BETA_QUALIFICATION_CTA_URL = PARTNER_LINK_PLACEHOLDER;

export const ONBOARDING_DASHBOARD_ROUTE = "/dashboard";

export const ONBOARDING_META_KEY = "onboarding_completed" as const;

export const onboardingContent = {
  welcome: {
    title: "Welcome",
    body: "Your account is ready. Next you'll set a simple daily goal, then build a website that recommends products — and you earn when people buy through your links.",
    continueCta: "Go to Home",
  },
  preparing: {
    title: "Getting your account ready",
    rows: [
      {
        label: "Membership confirmed",
        description: "You're signed in and ready to use the member tools.",
      },
      {
        label: "Home dashboard unlocked",
        description: "You'll see video training, simple steps, and quick links on Home.",
      },
      {
        label: "Website tools ready",
        description: "Pick a topic, add your product links, then launch your website.",
      },
    ],
    tip: "On Home, follow the three steps from top to bottom. Support is in the sidebar if you get stuck.",
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
