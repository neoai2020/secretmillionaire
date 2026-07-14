import type { FeatureId } from "./features.config";

export type NavIconName =
  | "LayoutGrid"
  | "Search"
  | "Brain"
  | "Radar"
  | "MessageSquare"
  | "GraduationCap"
  | "TrendingUp"
  | "Scan"
  | "Sparkles"
  | "Rocket"
  | "Wifi"
  | "Activity"
  | "Wallet"
  | "Headphones"
  | "Globe"
  | "Link2"
  | "FileText"
  | "MapPin"
  | "ShieldCheck"
  | "Repeat"
  | "Megaphone";

export interface NavItem {
  path: string;
  label: string;
  icon: NavIconName;
  feature?: FeatureId;
  workflowStep?: number;
  requiresWorkflowStep?: number;
}

export const homeNav: NavItem = {
  path: "/dashboard",
  label: "Home",
  icon: "LayoutGrid",
};

export const workflowSteps: NavItem[] = [
  {
    path: "/dashboard",
    label: "Home",
    icon: "LayoutGrid",
    feature: "extraction-workflow",
    workflowStep: 3,
  },
];

/** Always visible — Training & Support for every Initiate */
export const coreResourceNav: NavItem[] = [
  { path: "/training", label: "Member Training", icon: "GraduationCap" },
  { path: "/support", label: "Support", icon: "Headphones" },
];

export const blogBuilderWorkflowSteps: NavItem[] = [
  {
    path: "/territory",
    label: "Step 1: Pick Your Topic",
    icon: "MapPin",
    feature: "blog-builder",
    workflowStep: 1,
  },
  {
    path: "/arm-links",
    label: "Step 2: Add Your Links",
    icon: "Link2",
    feature: "blog-builder",
    workflowStep: 2,
    requiresWorkflowStep: 1,
  },
  {
    path: "/deploy",
    label: "Step 3: Launch Your Website",
    icon: "Rocket",
    feature: "blog-builder",
    workflowStep: 3,
    requiresWorkflowStep: 2,
  },
];

export const blogBuilderResourceNav: NavItem[] = [
  { path: "/asset", label: "My Websites", icon: "Globe", feature: "blog-builder" },
  { path: "/link-vault", label: "Link Vault", icon: "FileText", feature: "blog-builder" },
];

export const resourceNav: NavItem[] = [];

export const upgradeNav: NavItem[] = [];

/** Premium "Society Access" tools — high-value vaults unlocked for Initiates. */
export const premiumNav: NavItem[] = [
  { path: "/accelerator", label: "Accelerator", icon: "Rocket", feature: "premium-accelerator" },
  {
    path: "/recurring-wealth",
    label: "Recurring Wealth",
    icon: "Repeat",
    feature: "premium-recurring",
  },
  { path: "/social-payouts", label: "Social Payouts", icon: "Megaphone", feature: "premium-social" },
  { path: "/protector", label: "Wealth Protector", icon: "ShieldCheck", feature: "premium-protector" },
];

export const premiumSectionLabel = "Society Access";
