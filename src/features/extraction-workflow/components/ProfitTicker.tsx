"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";

function formatBalance(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ProfitTicker({ large = false }: { large?: boolean }) {
  const { balance } = useExtraction();
  const [display, setDisplay] = useState(balance);
  const prevBalance = useRef(balance);

  useEffect(() => {
    const start = prevBalance.current;
    const end = balance;
    prevBalance.current = balance;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const duration = 1200;
    const startTime = Date.now();
    let frame: number;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (end - start) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [balance]);

  return (
    <motion.div
      className={`rounded-xl border border-[#45A29E]/30 bg-[#0B0C10]/80 backdrop-blur-sm w-full ${
        large ? "px-4 sm:px-8 py-4 sm:py-6" : "px-3 sm:px-4 py-3"
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#45A29E] mb-1">
        Daily Earning Target
      </p>
      <p className="text-xs text-[#9fb0b5] mb-1">
        Your goal — earned when people buy through your links
      </p>
      <p
        className={`brand-font font-bold text-[#C5C6C7] tabular-nums ${
          large ? "text-3xl sm:text-4xl lg:text-5xl" : "text-xl sm:text-2xl"
        }`}
      >
        $<span>{formatBalance(display)}</span>
        <span className={`text-[#6b7280] font-sans font-medium ${large ? "text-lg sm:text-xl" : "text-sm"}`}>
          /day
        </span>
      </p>
    </motion.div>
  );
}
