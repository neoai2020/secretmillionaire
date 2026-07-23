"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, ChevronRight, Lock, X, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { brand } from "@/config/brand.config";
import {
  getVisibleWorkflowSteps,
  getCoreResourceNav,
  isNavItemLocked,
} from "@/lib/features";
import { PREMIUM_FEATURES, PREMIUM_SECTION_LABEL } from "@/lib/premium-features";
import { getNavIcon } from "@/lib/nav-icons";
import { SidebarPromos } from "./PromoOrchestrator";
import { useWorkflowNav } from "@/context/WorkflowNavContext";
import { BrandLogo } from "./BrandLogo";
import { SidebarStatusPanel } from "@/features/dopamine/components/SidebarStatusPanel";
import { isFeatureEnabled } from "@/config/features.config";
import { BlogBuilderNav } from "@/features/blog-builder/components/BlogBuilderNav";
import type { NavItem } from "@/config/navigation.config";

const COLLAPSE_KEY = "sms_sidebar_collapsed";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface SidebarContentProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
  showMobileClose?: boolean;
}

function SidebarContent({
  collapsed,
  onToggle,
  onMobileClose,
  showMobileClose = false,
}: SidebarContentProps) {
  const pathname = usePathname();
  const workflowSteps = getVisibleWorkflowSteps();
  const coreResourceNav = getCoreResourceNav();
  const workflow = useWorkflowNav();
  const workflowProgress = workflow.progress;
  const blogEnabled = isFeatureEnabled("blog-builder");

  const currentWorkflowIndex = workflowSteps.findIndex((s) => s.path === pathname);
  const progress =
    currentWorkflowIndex >= 0
      ? ((currentWorkflowIndex + 1) / Math.max(workflowSteps.length, 1)) * 100
      : 0;

  const handleLogout = async () => {
    onMobileClose?.();
    await workflow.resetSession();
  };

  const handleNavClick = () => onMobileClose?.();

  const renderNavLink = (item: NavItem, progress: number) => {
    const isActive = pathname === item.path;
    const Icon = getNavIcon(item.icon);
    const locked = isNavItemLocked(item, progress);

    if (locked) {
      return (
        <div
          key={item.path}
          className="command-nav-link py-3 sm:py-4 opacity-40 cursor-not-allowed"
          title="Complete the previous step first"
        >
          <div className={clsx("flex items-center gap-3 min-w-0", collapsed && "justify-center")}>
            <Lock size={18} className="text-text-muted shrink-0" />
            {!collapsed && (
              <span className="brand-font text-sm font-medium text-text-muted leading-snug">
                {item.label}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={handleNavClick}
        title={collapsed ? item.label : undefined}
        className={clsx("command-nav-link py-3 sm:py-4", isActive && "active", collapsed && "justify-center px-2")}
      >
        <div className={clsx("flex items-center gap-3 min-w-0 flex-1", collapsed && "justify-center")}>
          <Icon size={18} className={clsx("shrink-0", isActive ? "text-accent" : "text-text-muted")} />
          {!collapsed && (
            <span className="brand-font text-sm font-medium leading-snug">{item.label}</span>
          )}
        </div>
        {isActive && !collapsed && <ChevronRight size={14} className="text-accent ml-2 shrink-0" />}
      </Link>
    );
  };

  return (
    <>
      {workflowSteps.length > 0 && (
        <div className="absolute left-0 top-0 w-0.5 h-full bg-white/5 z-0">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            className="w-full"
            style={{
              backgroundColor: brand.colors.primary,
              boxShadow: "0 0 15px rgba(69,162,158,0.5), 0 0 30px rgba(212,175,55,0.15)",
            }}
            transition={{ duration: 1, ease: "circOut" }}
          />
        </div>
      )}

      <div
        className={clsx(
          "relative z-10 shrink-0 border-b border-white/5",
          collapsed ? "px-3 py-4" : "px-4 py-5"
        )}
      >
        <div
          className={clsx(
            "flex items-center",
            collapsed ? "flex-col gap-3" : "justify-between gap-2"
          )}
        >
          <Link
            href="/dashboard"
            onClick={handleNavClick}
            className={clsx("min-w-0", collapsed ? "flex justify-center" : "flex-1")}
            title={collapsed ? brand.productName : undefined}
          >
            <BrandLogo size="sm" compact={collapsed} splitTitle />
          </Link>
          <div className={clsx("flex items-center gap-1", collapsed && "flex-col")}>
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-text-muted transition-colors hover:bg-white/5 hover:text-text-heading lg:flex"
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            {showMobileClose && (
              <button
                type="button"
                aria-label="Close menu"
                onClick={onMobileClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-text-muted transition-colors hover:bg-white/5 hover:text-text-heading lg:hidden"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="sidebar-scrollbar relative z-10 flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-2 pb-4">
        {workflowSteps.length > 0 && (
          <>
            {!collapsed && (
              <span className="text-xs font-black tracking-[0.25em] text-text-muted uppercase px-3 sm:px-5 mb-2">
                Menu
              </span>
            )}
            {workflowSteps.map((step) => renderNavLink(step, workflowProgress))}
          </>
        )}

        {blogEnabled && (
          <BlogBuilderNav
            pathname={pathname}
            onNavClick={handleNavClick}
            collapsed={collapsed}
          />
        )}

        {PREMIUM_FEATURES.length > 0 && (
          <div className="mt-4">
            <div className={clsx("premium-nav-section", collapsed ? "p-1" : "p-2")}>
              {!collapsed && (
                <p className="relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3 pb-2 pt-1.5 text-[10px] font-black tracking-[0.25em] text-[#D4AF37] uppercase">
                  <Sparkles className="h-3 w-3 shrink-0 animate-pulse-glow" fill="currentColor" />
                  {PREMIUM_SECTION_LABEL}
                </p>
              )}
              <ul className="relative z-10 space-y-1">
                {PREMIUM_FEATURES.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={handleNavClick}
                        title={collapsed ? item.label : undefined}
                        className={clsx(
                          "premium-sidebar-item flex items-center gap-3 rounded-xl py-3 text-sm font-medium text-text-secondary",
                          collapsed ? "justify-center px-2" : "px-3 sm:px-4",
                          isActive && "is-active"
                        )}
                      >
                        <Icon
                          size={18}
                          className={clsx("shrink-0", isActive ? "text-[#D4AF37]" : "text-[#D4AF37]/80")}
                        />
                        {!collapsed && (
                          <span className="brand-font text-sm font-medium leading-snug">
                            {item.label}
                          </span>
                        )}
                        {!collapsed && isActive && (
                          <motion.span
                            layoutId="activePremiumIndicator"
                            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]"
                            style={{ boxShadow: "0 0 10px rgba(212, 175, 55, 0.7)" }}
                          />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {coreResourceNav.length > 0 && (
          <>
            {!collapsed && (
              <span className="text-[10px] font-black tracking-[0.25em] text-text-muted uppercase px-3 sm:px-5 mt-4 mb-2">
                Resources
              </span>
            )}
            {coreResourceNav.map((step) => renderNavLink(step, workflowProgress))}
          </>
        )}

        {!collapsed && <SidebarPromos />}

        <div className="mt-auto flex flex-col gap-4 pt-4 sm:pt-6">
          {isFeatureEnabled("extraction-workflow") && !collapsed && <SidebarStatusPanel />}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign Out" : undefined}
            className={clsx(
              "command-nav-link py-3 sm:py-4 text-red-400/60 hover:text-red-400 hover:bg-red-500/5",
              collapsed && "justify-center px-2"
            )}
          >
            <div className={clsx("flex items-center gap-3", collapsed && "justify-center")}>
              <LogOut size={18} className="shrink-0" />
              {!collapsed && <span className="brand-font text-sm font-medium">Sign Out</span>}
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    const isCollapsed = stored === "1";
    setCollapsed(isCollapsed);
    document.documentElement.dataset.sidebar = isCollapsed ? "collapsed" : "expanded";
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      document.documentElement.dataset.sidebar = next ? "collapsed" : "expanded";
      return next;
    });
  };

  return (
    <>
      <aside
        className="sidebar-glass fixed left-0 top-0 z-30 hidden h-dvh flex flex-col overflow-hidden transition-[width] duration-300 ease-out lg:flex"
        style={{ width: "var(--sidebar-w)" }}
      >
        <SidebarContent collapsed={collapsed} onToggle={toggleCollapse} />
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          "sidebar-glass fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(var(--sidebar-w),88vw)] flex-col overflow-hidden transition-transform duration-300 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          collapsed={false}
          onToggle={toggleCollapse}
          onMobileClose={onMobileClose}
          showMobileClose
        />
      </aside>
    </>
  );
}
