"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wifi, Loader2, ShieldCheck } from "lucide-react";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";
import { GlobalNetworkMap } from "@/features/extraction-workflow/components/GlobalNetworkMap";
import { ProfitTicker } from "@/features/extraction-workflow/components/ProfitTicker";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";
import { brand } from "@/config/brand.config";

export default function ConnectDashboardPage() {
  const router = useRouter();
  const { connected, isConnecting, connect } = useExtraction();

  const handleConnect = async () => {
    if (connected) {
      router.push("/scanner");
      return;
    }
    await connect();
    router.push("/scanner");
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#D4AF37]">
          Initiate Command Center
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-[#C5C6C7] tracking-tight">
          Establish Secure Connection
        </h1>
        <p className="text-[#6b7280] text-sm sm:text-base max-w-2xl leading-relaxed">
          Your private extraction node is standing by. Connect to the Society&apos;s encrypted server
          to begin scanning global data streams for unclaimed commissions.
        </p>
      </div>

      <ProfitTicker />

      <GlobalNetworkMap active={connected} />

      {isConnecting && (
        <AiLoadingBar label="Establishing secure connection" className="max-w-lg mx-auto w-full" />
      )}

      <motion.button
        type="button"
        onClick={handleConnect}
        disabled={isConnecting}
        whileHover={{ scale: isConnecting ? 1 : 1.01 }}
        whileTap={{ scale: isConnecting ? 1 : 0.99 }}
        animate={
          connected && !isConnecting
            ? {
                boxShadow: [
                  "0 0 28px rgba(69,162,158,0.30)",
                  "0 0 55px rgba(69,162,158,0.55)",
                  "0 0 28px rgba(69,162,158,0.30)",
                ],
              }
            : { boxShadow: "0 0 40px rgba(69,162,158,0.35)" }
        }
        transition={
          connected && !isConnecting
            ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
        className="relative w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] disabled:opacity-70 transition-all"
        style={{
          background: connected
            ? "linear-gradient(135deg, #45A29E 0%, #3d8f8b 100%)"
            : "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
        }}
      >
        <span className="flex items-center justify-center gap-2 sm:gap-3 text-center leading-snug">
          {isConnecting ? (
            <>
              <Loader2 className="animate-spin shrink-0" size={22} />
              <span>Establishing secure connection...</span>
            </>
          ) : connected ? (
            <>
              <ShieldCheck size={22} className="shrink-0" />
              <span>Connected — Proceed to Scan</span>
            </>
          ) : (
            <>
              <Wifi size={22} className="shrink-0" />
              <span>Connect to Private Server</span>
            </>
          )}
        </span>
      </motion.button>

      <p className="text-center text-[11px] text-[#6b7280]">
        {brand.memberLabel} access only · 256-bit encrypted tunnel
      </p>
    </div>
  );
}
