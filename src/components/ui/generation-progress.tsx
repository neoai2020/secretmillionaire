"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { EarningsBanner } from "@/components/ui/earnings-banner";
import { WelcomeOfferBanner } from "@/components/ui/welcome-offer-banner";

export type OfferBannerVariant = "earnings" | "welcome";

/**
 * Shown while the app is generating something.
 * Animated loading bar + contextual offer banner below it.
 */
export function GenerationProgress({
  label = "Working on it...",
  offer = "earnings",
}: {
  label?: string;
  offer?: OfferBannerVariant;
}) {
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + Math.max(1, Math.round((95 - prev) / 10))));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
        <p className="text-base font-semibold text-white">{label}</p>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-[#D4AF37]/30 bg-[#0c1414]">
        <div
          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#45A29E] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {offer === "welcome" ? <WelcomeOfferBanner compact /> : <EarningsBanner compact />}
    </div>
  );
}
