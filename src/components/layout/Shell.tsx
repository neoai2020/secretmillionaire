"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
    <div className="flex min-h-dvh overflow-hidden w-full bg-page">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-[padding] duration-300 lg:pl-[var(--sidebar-w)]">
        <header
          className="lg:hidden sticky top-0 z-30 mobile-header-glass shrink-0 safe-top border-b border-white/5"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-center px-4 py-3">
            <Link href="/dashboard" className="min-w-0" onClick={() => setSidebarOpen(false)}>
              <BrandLogo size="sm" showTagline={false} compact />
            </Link>
          </div>
          {showConnection && (
            <div className="px-4 pb-3 flex justify-center sm:justify-end">
              <ConnectionStatus />
            </div>
          )}
        </header>

        {showConnection && (
          <div className="hidden lg:flex sticky top-0 z-20 justify-end px-8 pt-4 pb-2">
            <ConnectionStatus />
          </div>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative app-main-canvas">
          <div className="app-glow-orb app-glow-orb-teal" aria-hidden />
          <div className="app-glow-orb app-glow-orb-gold" aria-hidden />
          <div className="app-glow-orb app-glow-orb-center" aria-hidden />
          <div className="app-content-layer px-4 sm:px-6 md:px-10 lg:px-12 pt-4 sm:pt-6 lg:pt-4 pb-24 sm:pb-28 lg:pb-16 max-w-7xl mx-auto min-h-full flex flex-col w-full">
            {children}
            <div className="mt-auto pt-10 sm:pt-16">
              <GlobalFooterPromo />
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
      <PromoOrchestrator />
    </div>
  );
}
