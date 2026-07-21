"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  Activity,
  Target,
  Loader2,
  Zap,
  MapPin,
  Link2,
  Rocket,
  Globe,
  GraduationCap,
  PlayCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";
import { GlobalNetworkMap } from "@/features/extraction-workflow/components/GlobalNetworkMap";
import { ScanTerminal } from "@/features/extraction-workflow/components/ScanTerminal";
import { ProfitTicker } from "@/features/extraction-workflow/components/ProfitTicker";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";
import { PageHeader } from "@/components/ui/page-header";
import { VideoThumbnailCard } from "@/components/ui/video-thumbnail-card";
import { GenerationProgress } from "@/components/ui/generation-progress";
import { EarningsBanner } from "@/components/ui/earnings-banner";
import { ContactSupportWidget } from "@/components/dashboard/ContactSupportWidget";
import { DashboardTipsWidget } from "@/components/dashboard/DashboardTipsWidget";
import { PremiumUpgradesWidget } from "@/components/dashboard/PremiumUpgradesWidget";
import { brand } from "@/config/brand.config";
import { trainingContent } from "@/config/training.config";

const INTRO_VIDEO = trainingContent.videos[0];

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: MapPin,
    title: "Pick your topic",
    time: "about 2 minutes",
    detail:
      "Choose what your website will be about. We give you ideas — just click the one you like.",
    href: "/territory",
    cta: "Pick my topic",
  },
  {
    step: 2,
    icon: Link2,
    title: "Add your payment links",
    time: "about 3 minutes",
    detail:
      "Paste in your special product links. When someone buys through your website, these links make sure the money goes to you.",
    href: "/arm-links",
    cta: "Add my links",
  },
  {
    step: 3,
    icon: Rocket,
    title: "Turn on your website",
    time: "about 1 minute",
    detail:
      "Click one button and your website goes live on the internet. We build the whole thing for you.",
    href: "/deploy",
    cta: "Turn it on",
  },
] as const;

const HOT_LINKS = [
  {
    href: "/territory",
    label: "Pick Your Topic",
    detail: "Start building your website",
    icon: MapPin,
  },
  {
    href: "/arm-links",
    label: "Add Your Links",
    detail: "Paste product links that pay you",
    icon: Link2,
  },
  {
    href: "/deploy",
    label: "Launch Your Website",
    detail: "Put your site online",
    icon: Rocket,
  },
  {
    href: "/asset",
    label: "My Websites",
    detail: "See clicks and live sites",
    icon: Globe,
  },
  {
    href: "/link-vault",
    label: "Link Vault",
    detail: "Manage saved product links",
    icon: FileText,
  },
  {
    href: "/training",
    label: "Training",
    detail: "Step-by-step guides",
    icon: GraduationCap,
  },
] as const;

interface DashboardStats {
  websites: number;
  articles: number;
  clicks: number;
}

export default function ConnectDashboardPage() {
  const {
    connected,
    scanned,
    extracted,
    isConnecting,
    isScanning,
    isRouting,
    commissionsFound,
    balance,
    connect,
    scan,
    extract,
  } = useExtraction();

  const [stats, setStats] = useState<DashboardStats>({ websites: 0, articles: 0, clicks: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [showOfferBanner, setShowOfferBanner] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blog/site", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const summaries = Array.isArray(data.summaries) ? data.summaries : [];
        const websites = summaries.length;
        const articles = summaries.reduce(
          (sum: number, s: { livePostCount?: number; postCount?: number }) =>
            sum + (s.livePostCount ?? s.postCount ?? 0),
          0
        );
        const clicks = summaries.reduce(
          (sum: number, s: { clickCount?: number }) => sum + (s.clickCount ?? 0),
          0
        );
        setStats({ websites, articles, clicks });
      })
      .catch(() => {
        /* leave zeros — dashboard still works */
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const running = isConnecting || isScanning;
  const setupDone = extracted;
  const needsSetup = !extracted;
  const setupPhase = scanned ? "C" : running ? "B" : "A";

  const handleBegin = async () => {
    if (running) return;
    setShowOfferBanner(true);
    if (!connected) await connect();
    if (!scanned) await scan();
  };

  const dailyGoal = extracted ? balance : commissionsFound;

  return (
    <div className="flex flex-col gap-8 sm:gap-10 w-full">
      <PageHeader
        eyebrow="Home"
        title={`Welcome to ${brand.productName}`}
        subtitle="You build a website that recommends products. When someone buys through your links, you get paid. You only need to do three things — each one takes just a few minutes."
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 flex flex-col gap-8 sm:gap-10">
      {/* Video training — top of page */}
      <section className="rounded-2xl border border-[#D4AF37]/25 bg-[#12141a] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <PlayCircle size={22} className="text-[#D4AF37]" />
          <h2 className="ds-h2">
            {INTRO_VIDEO?.title ?? "Video training"}
          </h2>
        </div>
        {INTRO_VIDEO ? (
          <VideoThumbnailCard
            videoId={INTRO_VIDEO.id}
            title={INTRO_VIDEO.title}
            caption={INTRO_VIDEO.description}
            eager
          />
        ) : (
          <div className="relative aspect-video w-full rounded-xl border border-[#1e2128] bg-[#0B0C10] flex flex-col items-center justify-center gap-2 text-center px-4">
            <PlayCircle size={40} className="text-[#6b7280]" />
            <p className="text-base text-[#9fb0b5] leading-relaxed max-w-lg">
              Walkthrough videos are coming soon. Until then, use the written guides.
            </p>
          </div>
        )}
        <Link
          href="/training"
          className="inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-xl font-bold text-white text-base max-w-md btn-primary"
        >
          Open training guides
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Here's how it works */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="brand-font text-2xl sm:text-3xl text-[#E2E8F0]">Here&apos;s how it works</h2>
          <p className="text-[#9fb0b5] text-base mt-1">
            You only need to do 3 things. Each one takes just a few minutes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="flex flex-col gap-3 rounded-2xl border border-[#45A29E]/25 bg-[#12141a] p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#45A29E]/15 text-[#45A29E] font-bold text-lg">
                  {item.step}
                </span>
                <span className="text-sm text-[#D4AF37] font-medium">{item.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <item.icon size={18} className="text-[#45A29E] shrink-0" />
                <h3 className="text-lg font-bold text-[#E2E8F0]">{item.title}</h3>
              </div>
              <p className="text-base text-[#9fb0b5] leading-relaxed flex-1">{item.detail}</p>
              <Link
                href={item.href}
                className="mt-auto inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-xl font-bold text-white text-base btn-primary"
              >
                {item.cta}
                <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
        <p className="text-base text-[#C5C6C7] rounded-xl border border-[#1e2128] bg-[#0B0C10]/60 px-4 py-3 leading-relaxed">
          That&apos;s it. After that, your website works for you. Come back anytime to check your
          progress — and if you ever get stuck, click Support and a real person will help you.
        </p>
      </section>

      {/* Compact setup (only if not finished) */}
      {needsSetup && (
        <section className="rounded-2xl border border-[#45A29E]/25 bg-[#12141a] p-5 sm:p-7 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
              Quick setup
            </p>
            <h2 className="brand-font text-xl sm:text-2xl text-[#E2E8F0]">
              {setupPhase === "C"
                ? "Set your daily goal"
                : "One short setup, then you can build"}
            </h2>
            <p className="text-[#9fb0b5] text-base mt-2 leading-relaxed max-w-2xl">
              {setupPhase === "C"
                ? "This number is a goal, not money in your bank. You earn it when people buy through your links."
                : "About 30 seconds. We connect your account, check commission opportunities, and show you a daily goal to aim for."}
            </p>
          </div>

          {setupPhase === "A" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Wifi, label: "Connect" },
                  { icon: Activity, label: "Scan" },
                  { icon: Target, label: "Your goal" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-3 rounded-xl border border-[#45A29E]/20 bg-[#0B0C10]/70 px-4 py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#45A29E]/15 text-[#45A29E] font-bold text-sm">
                      {i + 1}
                    </span>
                    <s.icon size={16} className="text-[#45A29E]" />
                    <span className="text-sm font-semibold text-[#E2E8F0]">{s.label}</span>
                  </div>
                ))}
              </div>
              <GlobalNetworkMap active={false} />
              <motion.button
                type="button"
                onClick={handleBegin}
                disabled={running}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 rounded-xl font-bold text-base sm:text-lg text-white btn-primary disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  <Zap size={22} />
                  Start quick setup
                </span>
              </motion.button>
            </>
          )}

          {setupPhase === "B" && (
            <AnimatePresence mode="wait">
              {isConnecting ? (
                <motion.div
                  key="connect"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  <GenerationProgress label="Step 1 of 3 — Connecting your account" />
                </motion.div>
              ) : (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  <GenerationProgress label="Step 2 of 3 — Looking for commission opportunities" />
                  <ScanTerminal active />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {showOfferBanner && setupPhase !== "B" && <EarningsBanner />}

          {setupPhase === "C" && (
            <div className="text-center flex flex-col gap-4">
              <p className="brand-font text-4xl sm:text-5xl text-[#D4AF37]">
                ${commissionsFound.toFixed(2)}
                <span className="text-lg text-[#9fb0b5] font-sans font-medium">/day</span>
              </p>
              {isRouting && (
                <AiLoadingBar label="Saving your goal" className="max-w-md mx-auto w-full" />
              )}
              <motion.button
                type="button"
                onClick={extract}
                disabled={isRouting}
                whileHover={{ scale: isRouting ? 1 : 1.02 }}
                className="w-full max-w-md mx-auto py-4 sm:py-5 px-4 rounded-xl font-bold text-base sm:text-lg text-white btn-primary disabled:opacity-70"
              >
                <span className="flex items-center justify-center gap-3">
                  {isRouting ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      Saving your goal...
                    </>
                  ) : (
                    "Save my daily goal"
                  )}
                </span>
              </motion.button>
            </div>
          )}
        </section>
      )}

      {/* Stats */}
      <section className="flex flex-col gap-4">
        <h2 className="brand-font text-2xl sm:text-3xl text-[#E2E8F0]">Your numbers</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Websites", value: statsLoading ? "…" : String(stats.websites) },
            { label: "Articles live", value: statsLoading ? "…" : String(stats.articles) },
            { label: "Link clicks", value: statsLoading ? "…" : String(stats.clicks) },
            {
              label: "Daily goal",
              value: dailyGoal > 0 ? `$${dailyGoal.toFixed(0)}` : "—",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[#45A29E]/20 bg-[#12141a] px-4 py-5"
            >
              <p className="text-sm text-[#9fb0b5] mb-1">{card.label}</p>
              <p className="brand-font text-2xl sm:text-3xl text-[#E2E8F0] tabular-nums">
                {card.value}
              </p>
            </div>
          ))}
        </div>
        {setupDone && dailyGoal > 0 && <ProfitTicker />}
      </section>

      {/* Hot links */}
      <section className="flex flex-col gap-4">
        <h2 className="brand-font text-2xl sm:text-3xl text-[#E2E8F0]">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HOT_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 rounded-2xl border border-[#1e2128] bg-[#0B0C10]/70 px-4 py-4 hover:border-[#45A29E]/40 transition-colors min-h-[4.5rem]"
            >
              <item.icon size={22} className="text-[#45A29E] shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-semibold text-[#E2E8F0]">{item.label}</p>
                <p className="text-sm text-[#9fb0b5] mt-0.5">{item.detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
        </div>

        <aside className="min-w-0 space-y-6 xl:col-span-1">
          <ContactSupportWidget />
          <div className="card-base border-[#1e2128] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9fb0b5] mb-4">Tips</p>
            <DashboardTipsWidget />
          </div>
          <PremiumUpgradesWidget />
        </aside>
      </div>

    </div>
  );
}
