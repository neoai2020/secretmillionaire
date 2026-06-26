"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";

export function ConnectionStatus() {
  const { connected } = useExtraction();

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-full border border-[#45A29E]/30 bg-[#45A29E]/5 text-[10px] sm:text-[11px] font-medium text-[#C5C6C7] max-w-full">
      <Circle
        size={8}
        className={`shrink-0 ${connected ? "text-[#45A29E] fill-[#45A29E] animate-pulse" : "text-[#6b7280] fill-[#6b7280]"}`}
      />
      <span className="text-center sm:text-left leading-snug">
        Server Status:{" "}
        <span className={connected ? "text-[#45A29E]" : "text-[#6b7280]"}>
          {connected ? "Encrypted & Active" : "Awaiting Connection"}
        </span>
      </span>
    </div>
  );
}
