"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { PREMIUM_FEATURES } from "@/lib/premium-features";

export function PremiumUpgradesWidget() {
  const pathname = usePathname();

  if (PREMIUM_FEATURES.length === 0) return null;

  return (
    <div className="premium-nav-section p-2">
      <div className="relative z-10 px-3 pb-3 pt-2.5">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D4AF37]">
          <Sparkles className="h-4 w-4 shrink-0 animate-pulse-glow" fill="currentColor" />
          Premium Upgrades
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-[#9fb0b5]">
          Unlock the tools that drive the biggest results.
        </p>
      </div>

      <div className="relative z-10 space-y-2">
        {PREMIUM_FEATURES.map((feature, index) => {
          const isActive = pathname === feature.href;
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <Link
                href={feature.href}
                className={`premium-upgrade-card group ${isActive ? "is-active" : ""}`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-300 ${
                    isActive
                      ? "from-[#D4AF37] to-[#45A29E] text-[#050A0A] shadow-[0_0_16px_rgba(212,175,55,0.45)]"
                      : "from-[#D4AF37]/25 to-[#45A29E]/20 text-[#D4AF37] group-hover:from-[#D4AF37] group-hover:to-[#45A29E] group-hover:text-[#050A0A] group-hover:shadow-[0_0_16px_rgba(212,175,55,0.45)]"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.5} />
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={`brand-font block text-sm font-bold tracking-wide ${
                      isActive ? "text-white" : "text-[#E2E8F0] group-hover:text-white"
                    }`}
                  >
                    {feature.label}
                  </span>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#9fb0b5]">
                    {feature.description}
                  </p>
                </div>

                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-[#D4AF37]/30 text-white"
                      : "bg-white/5 text-slate-500 group-hover:bg-[#D4AF37]/30 group-hover:text-white group-hover:translate-x-0.5"
                  }`}
                >
                  <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
