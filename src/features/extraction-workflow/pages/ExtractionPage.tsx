"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";
import { ProfitTicker } from "@/features/extraction-workflow/components/ProfitTicker";
import { EmpireBuilderDailyPlan } from "@/features/extraction-workflow/components/EmpireBuilderDailyPlan";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";

export default function ExtractionPage() {
  const { scanned, extracted, isRouting, extract, commissionsFound, balance } = useExtraction();

  useEffect(() => {
    if (!scanned && !extracted) {
      window.location.href = "/scanner";
    }
  }, [scanned, extracted]);

  const amount = extracted ? balance : commissionsFound;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#D4AF37]">Click 3</p>
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-[#C5C6C7] tracking-tight">
          Claim Your Affiliate Commissions
        </h1>
        <p className="text-[#6b7280] text-sm sm:text-base max-w-2xl leading-relaxed">
          Your scan mapped real affiliate commission potential across online platforms. Claim your
          slot below to lock in your earning target — then Empire Builder turns that opportunity
          into a live money site that pays you when people buy through your links.
        </p>
      </div>

      <ProfitTicker large />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-[#45A29E]/30 bg-[#12141a] p-5 sm:p-8 text-center"
      >
        {extracted ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 size={48} className="text-[#45A29E]" />
            <p className="text-lg font-bold text-[#C5C6C7]">Your Earning Window Is Open</p>
            <p className="text-sm text-[#C5C6C7] font-medium">
              Total Expected Balance:{" "}
              <span className="text-[#D4AF37]">${balance.toFixed(2)}/day</span>
            </p>
            <p className="text-sm text-[#6b7280] max-w-lg leading-relaxed">
              That number isn&apos;t in your bank account yet — it&apos;s the affiliate income
              opportunity we mapped for you. Here&apos;s how SMS members actually collect it: you
              share helpful content online, recommend products through your links, and earn a
              commission every time someone buys. No store, no inventory, no ad spend.
            </p>
            <p className="text-sm text-[#6b7280] max-w-lg leading-relaxed">
              Empire Builder does the heavy lifting — your blog, your SEO articles, your affiliate
              links woven in automatically. Follow the protocol below to go from this target to
              real daily commissions.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-1">
              Your Earning Target
            </p>
            <p className="text-xs text-[#6b7280] mb-3 max-w-md mx-auto leading-relaxed">
              Daily affiliate income target from your scan.
            </p>
            <p className="brand-font text-3xl sm:text-4xl lg:text-5xl text-[#D4AF37] mb-4 sm:mb-6">
              ${amount.toFixed(2)}
              <span className="text-lg sm:text-xl text-[#6b7280] font-sans font-medium">/day</span>
            </p>
            {isRouting && (
              <AiLoadingBar
                label="Claiming your affiliate commissions"
                className="max-w-md mx-auto w-full mb-4"
              />
            )}
            <motion.button
              type="button"
              onClick={extract}
              disabled={isRouting}
              whileHover={{ scale: isRouting ? 1 : 1.02 }}
              whileTap={{ scale: isRouting ? 1 : 0.98 }}
              className="w-full max-w-md mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
                boxShadow: "0 0 40px rgba(212, 175, 55, 0.35)",
              }}
            >
              <span className="flex items-center justify-center gap-3">
                {isRouting ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    Claiming your affiliate commissions...
                  </>
                ) : (
                  <>
                    <Wallet size={22} />
                    Claim Your Affiliate Commissions
                  </>
                )}
              </span>
            </motion.button>
          </>
        )}
      </motion.div>

      {extracted && <EmpireBuilderDailyPlan allocatedAmount={balance} />}
    </div>
  );
}
