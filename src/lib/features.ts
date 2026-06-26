import { isFeatureEnabled, type FeatureId } from "@/config/features.config";
import {
  homeNav,
  workflowSteps,
  blogBuilderWorkflowSteps,
  blogBuilderResourceNav,
  coreResourceNav,
  resourceNav,
  upgradeNav,
  type NavItem,
} from "@/config/navigation.config";

function filterNav(items: NavItem[]): NavItem[] {
  return items.filter((item) => !item.feature || isFeatureEnabled(item.feature));
}

export function getVisibleWorkflowSteps(): NavItem[] {
  return filterNav(workflowSteps);
}

export function getVisibleBlogBuilderWorkflowSteps(): NavItem[] {
  return filterNav(blogBuilderWorkflowSteps);
}

export function getVisibleBlogBuilderResourceNav(): NavItem[] {
  return filterNav(blogBuilderResourceNav);
}

export function getCoreResourceNav(): NavItem[] {
  return coreResourceNav;
}

export function getVisibleResourceNav(): NavItem[] {
  return filterNav(resourceNav);
}

export function getVisibleUpgradeNav(): NavItem[] {
  return filterNav(upgradeNav);
}

export function getAllVisibleNavItems(): NavItem[] {
  return [
    homeNav,
    ...getVisibleWorkflowSteps(),
    ...getCoreResourceNav(),
    ...getVisibleResourceNav(),
    ...getVisibleUpgradeNav(),
  ];
}

export function isNavItemLocked(
  item: NavItem,
  workflowProgress: number
): boolean {
  if (!item.requiresWorkflowStep) return false;
  return workflowProgress < item.requiresWorkflowStep;
}

export function getWorkflowProgress(
  pathname: string,
  hasVariations: boolean,
  hasAnalysis: boolean,
  hasSelectedAds: boolean
): number {
  if (pathname === "/replies" && hasSelectedAds) return 4;
  if (pathname === "/radar" || hasSelectedAds) return 3;
  if (pathname === "/analysis" || hasAnalysis) return 2;
  if (pathname === "/search" || hasVariations) return 1;
  return 0;
}

export function featureGuard(id: FeatureId): boolean {
  return isFeatureEnabled(id);
}
