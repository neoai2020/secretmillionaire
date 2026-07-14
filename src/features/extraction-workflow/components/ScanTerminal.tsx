"use client";

import { useEffect, useState } from "react";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";

const SCAN_LINES = [
  "Initializing encrypted handshake...",
  "Connecting to live affiliate networks...",
  "Reading commission rates on top-selling offers...",
  "Cross-referencing product demand data...",
  "Identifying commission opportunities...",
  "Mapping your daily earning potential...",
  "Target mapped — ready to lock in.",
];

export function ScanTerminal({ active }: { active: boolean }) {
  const [lines, setLines] = useState<string[]>([]);
  const loading = active && lines.length < SCAN_LINES.length;

  useEffect(() => {
    if (!active) {
      setLines([]);
      return;
    }
    let i = 0;
    setLines([`> ${SCAN_LINES[0]}`]);
    const interval = setInterval(() => {
      i += 1;
      if (i < SCAN_LINES.length) {
        setLines((prev) => [...prev, `> ${SCAN_LINES[i]}`]);
      } else {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="rounded-xl border border-[#45A29E]/25 bg-black/60 overflow-hidden">
      {loading && <AiLoadingBar label="Scanning data streams" className="px-3 sm:px-4 pt-3 sm:pt-4" />}
      <div className="p-3 sm:p-4 pt-2 font-mono text-xs sm:text-sm text-[#45A29E] h-40 sm:h-48 overflow-y-auto">
        {lines.length === 0 ? (
          <p className="text-[#6b7280]">&gt; Awaiting scan command...</p>
        ) : (
          lines.map((line, idx) => (
            <p key={idx} className="mb-1">
              {line}
            </p>
          ))
        )}
        {loading && <span className="inline-block w-2 h-4 bg-[#45A29E] animate-pulse ml-1" />}
      </div>
    </div>
  );
}
