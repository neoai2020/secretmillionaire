"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BrandLogo } from "./BrandLogo";
import { GlobalFooterPromo, PromoOrchestrator } from "./PromoOrchestrator";
import { ConnectionStatus } from "@/features/extraction-workflow/components/ConnectionStatus";
import { BottomNav } from "./BottomNav";
import { isFeatureEnabled } from "@/config/features.config";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showConnection = isFeatureEnabled("extraction-workflow");

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    pathname.startsWith("/auth/");

  const isPublicBlog = pathname.startsWith("/sites/");

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  if (isAuthPage || isPublicBlog) {
    return <>{children}</>;
  }

  return (
    <div className="app-bg flex min-h-dvh min-w-0 overflow-x-clip">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="mobile-header-glass fixed inset-x-0 top-0 z-40 shrink-0 border-b border-white/5 lg:hidden"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="grid h-14 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 px-4">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-text-muted transition-colors hover:bg-white/5 hover:text-text-heading"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/dashboard"
              className="min-w-0 justify-self-center"
              onClick={() => setSidebarOpen(false)}
            >
              <BrandLogo size="sm" showTagline={false} />
            </Link>
            <span className="w-9" aria-hidden />
          </div>
          {showConnection && (
            <div className="flex justify-center px-4 pb-3 sm:justify-end">
              <ConnectionStatus />
            </div>
          )}
        </header>

        <main
          className="relative min-w-0 flex-1 overflow-x-clip overflow-y-auto scroll-smooth px-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-[calc(3.5rem+env(safe-area-inset-top,0px))] transition-[padding] duration-300 sm:px-6 lg:pb-8 lg:pl-[calc(var(--sidebar-w)+var(--sidebar-gap))] lg:pr-8 lg:pt-8 app-main-canvas"
        >
          <div className="app-glow-orb app-glow-orb-teal" aria-hidden />
          <div className="app-glow-orb app-glow-orb-gold" aria-hidden />
          <div className="app-glow-orb app-glow-orb-center" aria-hidden />

          {showConnection && (
            <div className="app-content-layer mb-4 hidden justify-end lg:flex">
              <ConnectionStatus />
            </div>
          )}

          <div className="app-content-layer mx-auto flex min-h-full w-full min-w-0 max-w-7xl flex-col">
            {children}
            <div className="mt-auto pt-10 sm:pt-16">
              <GlobalFooterPromo />
            </div>
          </div>
        </main>
      </div>

      <BottomNav onOpenSidebar={() => setSidebarOpen(true)} />
      <PromoOrchestrator />
    </div>
  );
}
