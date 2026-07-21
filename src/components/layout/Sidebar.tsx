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

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
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
    <aside
      className={clsx(
        "sidebar-glass fixed inset-y-0 left-0 z-50 flex flex-col h-[100dvh] overflow-hidden shrink-0",
        "w-[min(18rem,88vw)] lg:w-[var(--sidebar-w)]",
        "transition-[width,transform] duration-300 ease-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "lg:static"
      )}
    >
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

      <div className="flex flex-col p-4 sm:p-6 gap-6 sm:gap-8 relative z-10 h-full">
        <div className="flex items-start justify-between gap-2">
          <Link
            href="/dashboard"
            className={clsx("min-w-0 flex-1", collapsed && "lg:flex lg:justify-center lg:flex-none")}
            onClick={handleNavClick}
          >
            <BrandLogo size="sm" compact={collapsed} />
          </Link>
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-text-muted hover:text-text-heading hover:bg-white/5"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onMobileClose}
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-text-muted hover:text-text-heading hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar pb-6">
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

          {blogEnabled && (!collapsed || mobileOpen) && (
            <BlogBuilderNav pathname={pathname} onNavClick={handleNavClick} />
          )}

          {PREMIUM_FEATURES.length > 0 && (
            <div className="mt-4">
              <div className={clsx("premium-nav-section", collapsed && !mobileOpen ? "p-1" : "p-2")}>
                {(!collapsed || mobileOpen) && (
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
                            collapsed && !mobileOpen ? "justify-center px-2" : "px-3 sm:px-4",
                            isActive && "is-active"
                          )}
                        >
                          <Icon
                            size={18}
                            className={clsx("shrink-0", isActive ? "text-[#D4AF37]" : "text-[#D4AF37]/80")}
                          />
                          {(!collapsed || mobileOpen) && (
                            <span className="brand-font text-sm font-medium leading-snug">
                              {item.label}
                            </span>
                          )}
                          {(!collapsed || mobileOpen) && isActive && (
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
              {(!collapsed || mobileOpen) && (
                <span className="text-[10px] font-black tracking-[0.25em] text-text-muted uppercase px-3 sm:px-5 mt-4 mb-2">
                  Resources
                </span>
              )}
              {coreResourceNav.map((step) => renderNavLink(step, workflowProgress))}
            </>
          )}

          {(!collapsed || mobileOpen) && <SidebarPromos />}

          <div className="mt-auto flex flex-col gap-4 pt-4 sm:pt-6">
            {(isFeatureEnabled("extraction-workflow")) && (!collapsed || mobileOpen) && (
              <SidebarStatusPanel />
            )}
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
      </div>
    </aside>
  );
}
