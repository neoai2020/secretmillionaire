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
  | "MapPin";

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
  label: "Command Center",
  icon: "LayoutGrid",
};

export const workflowSteps: NavItem[] = [
  {
    path: "/dashboard",
    label: "Click 1: Connect",
    icon: "Wifi",
    feature: "extraction-workflow",
    workflowStep: 1,
  },
  {
    path: "/scanner",
    label: "Click 2: Scan",
    icon: "Activity",
    feature: "extraction-workflow",
    workflowStep: 2,
    requiresWorkflowStep: 1,
  },
  {
    path: "/extraction",
    label: "Click 3: Claim",
    icon: "Wallet",
    feature: "extraction-workflow",
    workflowStep: 3,
    requiresWorkflowStep: 2,
  },
];

/** Always visible — Training & Support for every Initiate */
export const coreResourceNav: NavItem[] = [
  { path: "/training", label: "Member Training", icon: "GraduationCap" },
  { path: "/support", label: "Contact Q's Team", icon: "Headphones" },
];

export const blogBuilderWorkflowSteps: NavItem[] = [
  {
    path: "/territory",
    label: "Click 1: Choose Territory",
    icon: "MapPin",
    feature: "blog-builder",
    workflowStep: 1,
  },
  {
    path: "/arm-links",
    label: "Click 2: Arm Your Links",
    icon: "Link2",
    feature: "blog-builder",
    workflowStep: 2,
    requiresWorkflowStep: 1,
  },
  {
    path: "/deploy",
    label: "Click 3: Deploy Asset",
    icon: "Rocket",
    feature: "blog-builder",
    workflowStep: 3,
    requiresWorkflowStep: 2,
  },
];

export const blogBuilderResourceNav: NavItem[] = [
  { path: "/asset", label: "Asset Command", icon: "Globe", feature: "blog-builder" },
  { path: "/link-vault", label: "Link Vault", icon: "FileText", feature: "blog-builder" },
];

export const resourceNav: NavItem[] = [];

export const upgradeNav: NavItem[] = [];

export const premiumSectionLabel = "Society Access";
