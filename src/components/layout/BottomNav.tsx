"use client";

import {
  LayoutGrid,
  MapPin,
  FileText,
  GraduationCap,
  Menu,
  Rocket,
  Repeat,
  Megaphone,
  ShieldCheck,
  Globe,
  Headphones,
  ExternalLink,
  LogOut,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useWorkflowNav } from "@/context/WorkflowNavContext";
import { offers } from "@/config/offers.config";
import { trainingContent } from "@/config/training.config";
import { isFeatureEnabled } from "@/config/features.config";

const tabs = [
  { title: "Home", url: "/dashboard", icon: LayoutGrid },
  { title: "Topic", url: "/territory", icon: MapPin },
  { title: "Links", url: "/link-vault", icon: FileText },
  { title: "Training", url: "/training", icon: GraduationCap },
];

const premiumItems = [
  { title: "Accelerator", url: "/accelerator", icon: Rocket },
  { title: "Recurring Wealth", url: "/recurring-wealth", icon: Repeat },
  { title: "Social Payouts", url: "/social-payouts", icon: Megaphone },
  { title: "Wealth Protector", url: "/protector", icon: ShieldCheck },
].filter((item) => {
  if (item.url === "/accelerator") return isFeatureEnabled("premium-accelerator");
  if (item.url === "/recurring-wealth") return isFeatureEnabled("premium-recurring");
  if (item.url === "/social-payouts") return isFeatureEnabled("premium-social");
  if (item.url === "/protector") return isFeatureEnabled("premium-protector");
  return true;
});

const exclusiveOffers = [
  {
    title: "Earn $400/Day Testing New Apps",
    href: offers.quantumNode,
    icon: Sparkles,
  },
  {
    title: "Get Paid To Copy & Paste",
    href: offers.commissionStream,
    icon: Sparkles,
  },
  {
    title: "Fast Cash Training",
    href: trainingContent.externalTrainingUrl,
    icon: GraduationCap,
  },
];

const moreLinks = [
  { title: "Launch Website", url: "/deploy", icon: Rocket },
  { title: "My Websites", url: "/asset", icon: Globe },
  { title: "Support", url: "/support", icon: Headphones },
];

export function BottomNav() {
  const pathname = usePathname();
  const workflow = useWorkflowNav();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const tabUrls = tabs.map((t) => t.url);
  const premiumUrls = premiumItems.map((p) => p.url);
  const moreActive =
    !tabUrls.includes(pathname) &&
    !premiumUrls.some((u) => pathname.startsWith(u));

  const handleSignOut = async () => {
    setMoreOpen(false);
    await workflow.resetSession();
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#070D0D]/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-16">
          {tabs.map((tab) => {
            const isActive = pathname === tab.url;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.url}
                href={tab.url}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? "text-[#D4AF37]" : "text-slate-500 active:text-white"
                }`}
              >
                {isActive ? (
                  <span className="absolute top-0 left-3 right-3 h-[3px] rounded-b-full bg-gradient-to-r from-[#D4AF37] to-[#45A29E]" />
                ) : null}
                <Icon className="h-6 w-6" />
                <span className="text-[11px] font-semibold leading-none">{tab.title}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              moreActive ? "text-[#D4AF37]" : "text-slate-500 active:text-white"
            }`}
          >
            {moreActive ? (
              <span className="absolute top-0 left-3 right-3 h-[3px] rounded-b-full bg-gradient-to-r from-[#D4AF37] to-[#45A29E]" />
            ) : null}
            <Menu className="h-6 w-6" />
            <span className="text-[11px] font-semibold leading-none">More</span>
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#070D0D]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/15" />
            <div className="space-y-6 p-4">
              <div>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  More Pages
                </p>
                <div className="space-y-1.5">
                  {moreLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.url;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        onClick={() => setMoreOpen(false)}
                        className={`flex min-h-[52px] items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                          isActive
                            ? "bg-[#45A29E]/15 text-[#45A29E]"
                            : "text-slate-300 active:bg-white/5"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {premiumItems.length > 0 ? (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
                    Society Access
                  </p>
                  <div className="space-y-1.5">
                    {premiumItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname.startsWith(item.url);
                      return (
                        <Link
                          key={item.url}
                          href={item.url}
                          onClick={() => setMoreOpen(false)}
                          className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-4 py-3 text-base font-semibold ${
                            isActive
                              ? "border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]"
                              : "border-[#D4AF37]/20 text-[#D4AF37]/80 active:bg-[#D4AF37]/10"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-[#45A29E]">
                  Exclusive Offers
                </p>
                <div className="space-y-1.5">
                  {exclusiveOffers.map((offer) => {
                    const Icon = offer.icon;
                    return (
                      <a
                        key={offer.href + offer.title}
                        href={offer.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#45A29E]/25 bg-[#45A29E]/5 px-4 py-3 text-base font-semibold text-slate-200 active:bg-[#45A29E]/10"
                      >
                        <Icon className="h-5 w-5 text-[#45A29E]" />
                        <span className="flex-1">{offer.title}</span>
                        <ExternalLink className="h-4 w-4 text-[#45A29E]" />
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-slate-400 active:bg-white/5"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
