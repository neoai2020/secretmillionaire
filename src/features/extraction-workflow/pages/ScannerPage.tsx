"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2, ArrowRight } from "lucide-react";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";
import { ScanTerminal } from "@/features/extraction-workflow/components/ScanTerminal";
import { ProfitTicker } from "@/features/extraction-workflow/components/ProfitTicker";

export default function ScannerPage() {
  const router = useRouter();
  const { connected, scanned, isScanning, scan, commissionsFound } = useExtraction();

  useEffect(() => {
    if (!connected) router.replace("/dashboard");
  }, [connected, router]);

  const handleScan = async () => {
    if (scanned) {
      router.push("/extraction");
      return;
    }
    await scan();
    router.push("/extraction");
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#D4AF37]">Click 2</p>
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-[#C5C6C7] tracking-tight">Scan Data Streams</h1>
        <p className="text-[#6b7280] text-sm sm:text-base max-w-2xl leading-relaxed">
          The system is now parsing online platforms for lost digital chances and unclaimed
          affiliate commissions on your behalf.
        </p>
      </div>

      <ProfitTicker />

      <ScanTerminal active={isScanning || scanned} />

      {scanned && commissionsFound > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5 text-center"
        >
          <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">
            Affiliate Commissions Found
          </p>
          <p className="brand-font text-3xl text-[#C5C6C7]">
            ${commissionsFound.toFixed(2)}
            <span className="text-sm text-[#6b7280] font-sans font-medium">/day</span>
          </p>
        </motion.div>
      )}

      <motion.button
        type="button"
        onClick={handleScan}
        disabled={isScanning || !connected}
        whileHover={{ scale: isScanning ? 1 : 1.01 }}
        className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
          boxShadow: "0 0 40px rgba(69, 162, 158, 0.35)",
        }}
      >
        <span className="flex items-center justify-center gap-3">
          {isScanning ? (
            <>
              <Loader2 className="animate-spin" size={22} />
              Scanning retail networks...
            </>
          ) : scanned ? (
            <>
              Claim Your Affiliate Commissions
              <ArrowRight size={22} />
            </>
          ) : (
            <>
              <Activity size={22} />
              Scan for Lost Digital Chances
            </>
          )}
        </span>
      </motion.button>
    </div>
  );
}
