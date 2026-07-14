"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  Activity,
  Target,
  Loader2,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";
import { GlobalNetworkMap } from "@/features/extraction-workflow/components/GlobalNetworkMap";
import { ScanTerminal } from "@/features/extraction-workflow/components/ScanTerminal";
import { ProfitTicker } from "@/features/extraction-workflow/components/ProfitTicker";
import { EmpireBuilderDailyPlan } from "@/features/extraction-workflow/components/EmpireBuilderDailyPlan";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";
import { brand } from "@/config/brand.config";

const PREVIEW_STEPS = [
  { icon: Wifi, label: "Connect", detail: "Join the private network" },
  { icon: Activity, label: "Scan", detail: "Find commission opportunities" },
  { icon: Target, label: "Your Target", detail: "See your daily goal" },
] as const;

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

  const running = isConnecting || isScanning;

  const handleBegin = async () => {
    if (running) return;
    if (!connected) await connect();
    if (!scanned) await scan();
  };

  // A: intro, B: running, C: target reveal, D: activated
  const state = extracted ? "D" : scanned ? "C" : running ? "B" : "A";

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full mx-auto">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#D4AF37]">
          {state === "D" ? "Protocol Active" : "Start Here"}
        </p>
        <h1 className="brand-font text-3xl sm:text-4xl lg:text-5xl text-[#E2E8F0] tracking-tight">
          {state === "D"
            ? "You're Activated — Build Your Money Site"
            : state === "C"
              ? "Your Daily Earning Target Is Ready"
              : "Activate Your Money Site Protocol"}
        </h1>
        {(state === "A" || state === "B") && (
          <p className="text-[#9fb0b5] text-base sm:text-lg max-w-2xl leading-relaxed">
            Here&apos;s the play: Society members earn affiliate commissions — you get a website
            that recommends products, and when readers buy through your links, you get paid.
            Activation takes about 30 seconds: we connect you to the network, scan live affiliate
            platforms for commission opportunities, and map your daily earning target.
          </p>
        )}
        {state === "C" && (
          <p className="text-[#9fb0b5] text-base sm:text-lg max-w-2xl leading-relaxed">
            The scan mapped commission opportunities across live affiliate platforms. Below is
            your daily earning target — lock it in, and Empire Builder turns it into a live money
            site that earns when people buy through your links.
          </p>
        )}
        {state === "D" && (
          <p className="text-[#9fb0b5] text-base sm:text-lg max-w-2xl leading-relaxed">
            Your target is locked. Follow the Empire Builder protocol below — publish content
            people search for, and earn a commission every time a reader buys through your links.
          </p>
        )}
      </div>

      {/* ---------- State A: intro ---------- */}
      {state === "A" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PREVIEW_STEPS.map((step, i) => (
              <div
                key={step.label}
                className="flex items-center gap-3 rounded-xl border border-[#45A29E]/20 bg-[#0B0C10]/70 px-4 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#45A29E]/15 text-[#45A29E] font-bold text-sm">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#E2E8F0] leading-tight flex items-center gap-1.5">
                    <step.icon size={14} className="text-[#45A29E] shrink-0" />
                    {step.label}
                  </p>
                  <p className="text-xs text-[#9fb0b5] leading-tight mt-0.5">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <GlobalNetworkMap active={false} />
        </>
      )}

      {/* ---------- State B: running phases ---------- */}
      {state === "B" && (
        <AnimatePresence mode="wait">
          {isConnecting ? (
            <motion.div
              key="phase-connect"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-4"
            >
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#45A29E]">
                Phase 1 of 3 — Connecting you to the private network…
              </p>
              <GlobalNetworkMap active />
              <AiLoadingBar label="Establishing secure connection" className="max-w-lg mx-auto w-full" />
            </motion.div>
          ) : (
            <motion.div
              key="phase-scan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-4"
            >
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#45A29E]">
                Phase 2 of 3 — Scanning affiliate networks for commission opportunities…
              </p>
              <ScanTerminal active />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ---------- State C: target reveal ---------- */}
      {state === "C" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-[#D4AF37]/30 bg-[#12141a] p-6 sm:p-10 text-center"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-3">
            Phase 3 of 3 — Your Daily Earning Target
          </p>
          <p className="text-base text-[#9fb0b5] mb-4 max-w-lg mx-auto leading-relaxed">
            This is a goal, not a balance. You earn it as real people buy through your affiliate
            links.
          </p>
          <p className="brand-font text-4xl sm:text-5xl lg:text-6xl text-[#D4AF37] mb-6">
            ${commissionsFound.toFixed(2)}
            <span className="text-lg sm:text-xl text-[#9fb0b5] font-sans font-medium">/day</span>
          </p>

          {isRouting && (
            <AiLoadingBar label="Locking in your target" className="max-w-md mx-auto w-full mb-4" />
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
                  Locking in your target...
                </>
              ) : (
                <>
                  <Lock size={22} />
                  Lock In My Target
                </>
              )}
            </span>
          </motion.button>

          <p className="text-sm text-[#9fb0b5] mt-4">
            Next: Empire Builder turns this target into a live money site.
          </p>
        </motion.div>
      )}

      {/* ---------- State D: activated ---------- */}
      {state === "D" && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[#45A29E]/30 bg-[#12141a] p-5 sm:p-6"
          >
            <CheckCircle2 size={36} className="text-[#45A29E] shrink-0" />
            <div className="text-center sm:text-left flex-1 min-w-0">
              <p className="text-base font-bold text-[#E2E8F0]">
                Target locked: <span className="text-[#D4AF37]">${balance.toFixed(2)}/day</span>
              </p>
              <p className="text-sm text-[#9fb0b5] leading-relaxed mt-1">
                Your goal, not a balance — you earn it as people buy through your links. The
                protocol below is how members get there.
              </p>
            </div>
          </motion.div>

          <ProfitTicker large />

          <EmpireBuilderDailyPlan allocatedAmount={balance} />
        </>
      )}

      {/* ---------- Main CTA (states A + B) ---------- */}
      {(state === "A" || state === "B") && (
        <motion.button
          type="button"
          onClick={handleBegin}
          disabled={running}
          whileHover={{ scale: running ? 1 : 1.01 }}
          whileTap={{ scale: running ? 1 : 0.99 }}
          className="relative w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] disabled:opacity-70 transition-all"
          style={{
            background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
            boxShadow: "0 0 40px rgba(69, 162, 158, 0.35)",
          }}
        >
          <span className="flex items-center justify-center gap-2 sm:gap-3 text-center leading-snug">
            {running ? (
              <>
                <Loader2 className="animate-spin shrink-0" size={22} />
                <span>{isConnecting ? "Connecting to the network..." : "Scanning affiliate networks..."}</span>
              </>
            ) : (
              <>
                <Zap size={22} className="shrink-0" />
                <span>Begin Activation</span>
              </>
            )}
          </span>
        </motion.button>
      )}

      <p className="text-center text-sm text-[#8b9ba1]">
        {brand.memberLabel} access only · 256-bit encrypted tunnel
      </p>
    </div>
  );
}
