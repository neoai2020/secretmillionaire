import { support } from "./support.config";
import { trainingContent } from "./training.config";
import { offers } from "./offers.config";

export type PromoTemplate =
  | "horizontal-banner"
  | "footer-card"
  | "sidebar-card"
  | "modal"
  | "toast";

export type PromoPlacement =
  | "global-top"
  | "global-footer"
  | "sidebar"
  | "modal"
  | "toast-bl";

export interface PromoSlot {
  id: string;
  enabled: boolean;
  template: PromoTemplate;
  placement: PromoPlacement;
  content: {
    headline: string;
    body?: string | string[];
    ctaLabel?: string;
    ctaUrl?: string;
    icon?: string;
    badge?: string;
    bullets?: string[];
    scarcity?: { current: number; total: number; label: string };
    subtitle?: string;
    title?: string;
    stats?: { icon: string; text: string; highlight?: string }[];
    sidebarSubtitle?: string;
    toastAmount?: string;
    toastMessage?: string;
  };
  behavior?: {
    delayMs?: number;
    sessionKey?: string;
    intervalMinMs?: number;
    intervalMaxMs?: number;
    pauseWhenSlotId?: string;
    priority?: number;
  };
}

export const promoSlots: PromoSlot[] = [
  {
    id: "global-top",
    enabled: false,
    template: "horizontal-banner",
    placement: "global-top",
    content: {
      headline: "Want To Multiply Your Results?",
      body: [
        "Your core product is powerful — unlock advanced training to scale further.",
        "This training is free for all members. Tap the button below to learn more.",
      ],
      ctaLabel: "Click Here To Learn How",
      ctaUrl: trainingContent.externalTrainingUrl,
      icon: "Sparkles",
    },
  },
  {
    id: "global-footer",
    enabled: true,
    template: "footer-card",
    placement: "global-footer",
    content: {
      headline: support.headline,
      title: support.headline,
      subtitle: support.subcopy,
      ctaLabel: support.ctaLabel,
      ctaUrl: support.contactUrl,
      icon: "Headphones",
      stats: support.stats.map((s) => ({
        icon: s.icon,
        text: s.label,
        highlight: "highlight" in s ? s.highlight : undefined,
      })),
    },
  },
  {
    id: "sidebar-promo-1",
    enabled: true,
    template: "sidebar-card",
    placement: "sidebar",
    content: {
      headline: "Earn $400/Day Testing New Apps",
      ctaUrl: offers.quantumNode,
      sidebarSubtitle: "Claim Now",
    },
  },
  {
    id: "sidebar-promo-2",
    enabled: true,
    template: "sidebar-card",
    placement: "sidebar",
    content: {
      headline: "Get Paid To Copy & Paste",
      ctaUrl: offers.commissionStream,
      sidebarSubtitle: "Claim Now",
    },
  },
  {
    id: "sidebar-promo-3",
    enabled: true,
    template: "sidebar-card",
    placement: "sidebar",
    content: {
      headline: "Fast Cash Training",
      ctaUrl: trainingContent.externalTrainingUrl,
      sidebarSubtitle: "Claim Now",
    },
  },
  {
    id: "onboarding-claim",
    enabled: true,
    template: "modal",
    placement: "modal",
    content: {
      badge: "OPTIONAL OFFER",
      headline: "Partner Opportunity",
      ctaLabel: "Learn More",
      ctaUrl: offers.innerVaultAccess,
    },
  },
  {
    id: "modal-training",
    enabled: true,
    template: "modal",
    placement: "modal",
    content: {
      badge: "LIMITED FREE TRAINING",
      headline: "Exclusive Member Training",
      body: "Learn the advanced system members use to scale results.",
      bullets: [
        "Step-by-step walkthrough",
        "Copy-paste templates included",
        "Works with any niche",
      ],
      scarcity: { current: 8, total: 10, label: "spots claimed today" },
      ctaLabel: "Get Free Access Now",
      ctaUrl: trainingContent.externalTrainingUrl,
    },
    behavior: {
      delayMs: 800,
      sessionKey: "sms_training_popup",
    },
  },
  {
    id: "toast-withdraw",
    enabled: false,
    template: "toast",
    placement: "toast-bl",
    content: {
      headline: "Withdrawal Available",
      toastAmount: "$0.00",
      toastMessage: "You may be eligible to withdraw earnings",
      ctaLabel: "Claim Now",
      ctaUrl: offers.withdrawRouting,
    },
    behavior: {
      delayMs: 2500,
      sessionKey: "sms_withdraw_shown",
      priority: 10,
    },
  },
  {
    id: "toast-social",
    enabled: false,
    template: "toast",
    placement: "toast-bl",
    content: {
      headline: "Member Activity",
      toastMessage: "just earned",
      toastAmount: "$0",
    },
    behavior: {
      intervalMinMs: 15000,
      intervalMaxMs: 25000,
      pauseWhenSlotId: "toast-withdraw",
      priority: 1,
    },
  },
];

export function getPromoSlot(id: string): PromoSlot | undefined {
  return promoSlots.find((s) => s.id === id && s.enabled);
}

export function getPromosByPlacement(placement: PromoPlacement): PromoSlot[] {
  return promoSlots.filter((s) => s.placement === placement && s.enabled);
}
