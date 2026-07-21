import type { LucideIcon } from "lucide-react";
import { premiumNav, premiumSectionLabel } from "@/config/navigation.config";
import { getNavIcon } from "@/lib/nav-icons";
import { isFeatureEnabled } from "@/config/features.config";

export interface PremiumFeature {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const PREMIUM_SECTION_LABEL = premiumSectionLabel;

/** One-line plain descriptions keyed by route — shown in the dashboard widget. */
const PREMIUM_DESCRIPTIONS: Record<string, string> = {
  "/accelerator": "Build unlimited websites and ready-to-post content.",
  "/recurring-wealth": "Offers that pay you again every month.",
  "/social-payouts": "Ready-made Facebook posts that earn you money.",
  "/protector": "Keeps your account and earnings locked down.",
};

/**
 * Single source of truth for premium ("Society Access") features.
 * Used by the sidebar, the mobile nav, and the dashboard Premium Upgrades widget.
 */
export const PREMIUM_FEATURES: PremiumFeature[] = premiumNav
  .filter((item) => !item.feature || isFeatureEnabled(item.feature))
  .map((item) => ({
    href: item.path,
    label: item.label,
    description: PREMIUM_DESCRIPTIONS[item.path] ?? "Unlock more with your membership.",
    icon: getNavIcon(item.icon),
  }));
