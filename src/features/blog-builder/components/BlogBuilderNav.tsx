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
}

export function BlogBuilderNav({ pathname, onNavClick }: BlogBuilderNavProps) {
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
          className="command-nav-link py-3 sm:py-4 opacity-40 cursor-not-allowed"
          title="Complete the previous step first"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Lock size={18} className="text-text-muted shrink-0" />
            <span className="brand-font text-sm font-medium text-text-muted leading-snug">
              {item.label}
            </span>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={onNavClick}
        className={clsx("command-nav-link py-3 sm:py-4", isActive && "active")}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Icon size={18} className={clsx("shrink-0", isActive ? "text-accent" : "text-text-muted")} />
          <span className="brand-font text-sm font-medium leading-snug">{item.label}</span>
        </div>
        {isActive && <ChevronRight size={14} className="text-accent ml-2 shrink-0" />}
      </Link>
    );
  };

  if (blogSteps.length === 0) return null;

  return (
    <>
      <span className="text-[10px] font-black tracking-[0.25em] text-[#6b7280] uppercase px-3 sm:px-5 mt-4 mb-2">
        Empire Builder
      </span>
      {blogSteps.map(renderNavLink)}
      {blogResources.map(renderNavLink)}
    </>
  );
}
