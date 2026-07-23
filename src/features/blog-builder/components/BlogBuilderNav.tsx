"use client";

import {
  getVisibleBlogBuilderWorkflowSteps,
  getVisibleBlogBuilderResourceNav,
  isNavItemLocked,
} from "@/lib/features";
import { getNavIcon } from "@/lib/nav-icons";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { clsx } from "clsx";
import type { NavItem } from "@/config/navigation.config";
import { useBlogBuilder } from "../context/BlogBuilderContext";

interface BlogBuilderNavProps {
  pathname: string;
  onNavClick: () => void;
  collapsed?: boolean;
}

export function BlogBuilderNav({ pathname, onNavClick, collapsed = false }: BlogBuilderNavProps) {
  const blogSteps = getVisibleBlogBuilderWorkflowSteps();
  const blogResources = getVisibleBlogBuilderResourceNav();
  const { blogProgress } = useBlogBuilder();

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.path;
    const Icon = getNavIcon(item.icon);
    const locked = isNavItemLocked(item, blogProgress);

    if (locked) {
      return (
        <div
          key={item.path}
          className={clsx(
            "command-nav-link py-3 sm:py-4 opacity-40 cursor-not-allowed",
            collapsed && "justify-center px-2"
          )}
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
        onClick={onNavClick}
        title={collapsed ? item.label : undefined}
        className={clsx(
          "command-nav-link py-3 sm:py-4",
          isActive && "active",
          collapsed && "justify-center px-2"
        )}
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

  if (blogSteps.length === 0) return null;

  return (
    <>
      {!collapsed && (
        <span className="text-xs font-black tracking-[0.25em] text-[#6b7280] uppercase px-3 sm:px-5 mt-3 mb-1.5">
          Build Your Website
        </span>
      )}
      {blogSteps.map(renderNavLink)}
      {blogResources.map(renderNavLink)}
    </>
  );
}
