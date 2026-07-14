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
    label: "Step 1: Pick Your Topic",
    usage: "Do this once",
    detail:
      "Choose something you enjoy — gardening, fishing, cooking, anything. Your website will be about this topic.",
    href: "/territory",
  },
  {
    icon: Link2,
    label: "Step 2: Add Your Links",
    usage: "2–3 products",
    detail:
      "Paste in your special product links. When somebody buys through one of them, the company pays you.",
    href: "/arm-links",
  },
  {
    icon: Rocket,
    label: "Step 3: Launch Your Website",
    usage: "One button",
    detail:
      "Press one button and the system builds your website for you — articles, pictures, and your links, all included.",
    href: "/deploy",
  },
  {
    icon: Globe,
    label: "My Websites",
    usage: "Check daily — 5 minutes",
    detail:
      "See your live website, how many people visited, and how many clicked your links.",
    href: "/asset",
  },
  {
    icon: FileText,
    label: "Link Vault",
    usage: "Once a week",
    detail: "All your product links are saved here. Add new ones whenever you like.",
    href: "/link-vault",
  },
] as const;

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function EmpireBuilderDailyPlan({ allocatedAmount }: EmpireBuilderDailyPlanProps) {
  const dailyTarget = roundMoney(allocatedAmount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#D4AF37]/25 bg-[#12141a] p-5 sm:p-8 text-left"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
        Your Simple Plan
      </p>
      <h2 className="brand-font text-xl sm:text-2xl text-[#C5C6C7] mb-3">
        Your goal: ${dailyTarget.toFixed(2)} a day
      </h2>
      <p className="text-base text-[#9fb0b5] mb-4 leading-relaxed">
        How do you get there? You get your own website. It recommends products to people. When
        somebody buys a product through your website, the company pays you a commission. The three
        steps below set it all up — the system does the hard work for you.
      </p>
      <p className="text-base text-[#C5C6C7]/90 mb-6 leading-relaxed rounded-lg border border-[#1e2128] bg-[#0B0C10]/60 px-4 py-3">
        You never sell anything yourself. You never talk to customers or ship boxes. Your website
        does the recommending — you collect the commission, even while you sleep.
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
        Start Step 1: Pick Your Topic
        <ArrowRight size={20} />
      </Link>
    </motion.div>
  );
}
