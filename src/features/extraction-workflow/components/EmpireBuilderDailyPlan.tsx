"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Link2, Rocket, Globe, FileText } from "lucide-react";

interface EmpireBuilderDailyPlanProps {
  allocatedAmount: number;
}

const USAGE_STEPS = [
  {
    icon: MapPin,
    label: "Choose Territory",
    usage: "Once — pick your niche",
    detail:
      "Select a hobby or topic you enjoy. Your money site will rank for it and attract buyers in that space.",
    href: "/territory",
  },
  {
    icon: Link2,
    label: "Arm Your Links",
    usage: "2–3 products to promote",
    detail:
      "Add DigiStore affiliate links — these are the products you recommend and earn commission on when someone buys.",
    href: "/arm-links",
  },
  {
    icon: Rocket,
    label: "Deploy Asset",
    usage: "1 deploy — 7 SEO posts",
    detail:
      "AI builds your blog with helpful articles and your affiliate links built in. This is your commission engine.",
    href: "/deploy",
  },
  {
    icon: Globe,
    label: "Asset Command",
    usage: "Daily — 5 min check",
    detail:
      "Watch traffic and clicks on your live site. Every click is a potential commission.",
    href: "/asset",
  },
  {
    icon: FileText,
    label: "Link Vault",
    usage: "Weekly — fresh offers",
    detail:
      "Swap in new affiliate products as you grow. More relevant offers = more commissions.",
    href: "/link-vault",
  },
] as const;

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function EmpireBuilderDailyPlan({ allocatedAmount }: EmpireBuilderDailyPlanProps) {
  const dailyTarget = roundMoney(allocatedAmount);
  const weeklyTarget = roundMoney(dailyTarget * 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#D4AF37]/25 bg-[#12141a] p-5 sm:p-8 text-left"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
        Affiliate Marketing, Simplified
      </p>
      <h2 className="brand-font text-xl sm:text-2xl text-[#C5C6C7] mb-2">
        Your path to ${dailyTarget.toFixed(2)}/day (~${weeklyTarget.toFixed(2)}/week)
      </h2>
      <p className="text-base text-[#9fb0b5] mb-4 leading-relaxed">
        That matches your ${dailyTarget.toFixed(2)}/day earning target — the daily affiliate
        income members in your position aim for. Run Empire Builder consistently: publish content
        people search for, and get paid when readers buy through your links.
      </p>
      <p className="text-sm text-[#C5C6C7]/90 mb-6 leading-relaxed rounded-lg border border-[#1e2128] bg-[#0B0C10]/60 px-4 py-3">
        You&apos;re not selling face-to-face or running ads. You&apos;re building a small corner of
        the internet that recommends products and earns while you sleep. That&apos;s affiliate
        marketing — and Empire Builder makes it push-button simple.
      </p>

      <ul className="flex flex-col gap-3 mb-6">
        {USAGE_STEPS.map((step) => (
          <li
            key={step.label}
            className="flex gap-3 rounded-xl border border-[#1e2128] bg-[#0B0C10]/60 p-4"
          >
            <step.icon size={20} className="text-[#45A29E] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-semibold text-[#C5C6C7] text-base">{step.label}</span>
                <span className="text-sm text-[#D4AF37] font-medium">{step.usage}</span>
              </div>
              <p className="text-sm text-[#9fb0b5] mt-1 leading-relaxed">{step.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <Link
        href="/territory"
        className="flex items-center justify-center gap-2 w-full max-w-md mx-auto py-4 px-6 rounded-xl font-bold text-[#0B0C10] text-base"
        style={{
          background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
          boxShadow: "0 0 40px rgba(69, 162, 158, 0.35)",
        }}
      >
        Build My Commission Site — Click 1
        <ArrowRight size={20} />
      </Link>
    </motion.div>
  );
}
