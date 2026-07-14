"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BrandLogo } from "./BrandLogo";
import {
  GlobalTopPromo,
  GlobalFooterPromo,
  PromoOrchestrator,
} from "./PromoOrchestrator";
import { ConnectionStatus } from "@/features/extraction-workflow/components/ConnectionStatus";
import { WithdrawPopup } from "@/features/dopamine/components/WithdrawPopup";
import { SocialProofToast } from "@/features/dopamine/components/SocialProofToast";
import { FreeTrainingPopup } from "@/features/dopamine/components/FreeTrainingPopup";
import { isFeatureEnabled } from "@/config/features.config";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const showConnection = isFeatureEnabled("extraction-workflow");
  const showDopamine = isFeatureEnabled("dopamine");

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
    <div className="flex h-[100dvh] overflow-hidden w-full bg-page">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="lg:hidden sticky top-0 z-30 mobile-header-glass shrink-0 safe-top">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-text-heading hover:bg-white/5"
            >
              <Menu size={20} />
            </button>
            <Link href="/dashboard" className="min-w-0 flex-1" onClick={() => setSidebarOpen(false)}>
              <BrandLogo size="sm" showTagline={false} compact />
            </Link>
            <div className="w-10 shrink-0" aria-hidden />
          </div>
          {showConnection && (
            <div className="px-4 pb-3 flex justify-center sm:justify-end">
              <ConnectionStatus />
            </div>
          )}
        </header>

        {showConnection && (
          <div className="hidden lg:flex sticky top-0 z-20 justify-end px-8 lg:px-12 pt-4 pb-2">
            <ConnectionStatus />
          </div>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative app-main-canvas">
          <div className="app-glow-orb app-glow-orb-teal" aria-hidden />
          <div className="app-glow-orb app-glow-orb-gold" aria-hidden />
          <div className="app-glow-orb app-glow-orb-center" aria-hidden />
          <div className="app-content-layer px-4 sm:px-6 md:px-10 lg:px-12 pt-4 sm:pt-6 lg:pt-4 pb-10 sm:pb-12 lg:pb-16 max-w-5xl mx-auto min-h-full flex flex-col w-full">
            <GlobalTopPromo />
            {children}
            <div className="mt-auto pt-10 sm:pt-16">
              <GlobalFooterPromo />
            </div>
          </div>
        </main>
      </div>

      <PromoOrchestrator />
      {showDopamine && (
        <>
          <WithdrawPopup onVisibilityChange={setWithdrawVisible} />
          <SocialProofToast paused={withdrawVisible} />
          <FreeTrainingPopup />
        </>
      )}
    </div>
  );
}
