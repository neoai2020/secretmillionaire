"use client";

import { useEffect, useState } from "react";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";

const DEPLOY_LINES = [
  "Allocating encrypted publishing node...",
  "Generating pillar authority content...",
  "Spinning up cluster posts (6 angles)...",
  "Rendering nano-banana visuals...",
  "Weaving armed affiliate links...",
  "Injecting SEO metadata + internal links...",
  "Deploying cash asset to public network...",
  "Money site is live — traffic routing enabled.",
];

export function GenerationTerminal({ active }: { active: boolean }) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!active) {
      setLines([]);
      return;
    }
    let i = 0;
    setLines([`> ${DEPLOY_LINES[0]}`]);
    const interval = setInterval(() => {
      i += 1;
      if (i < DEPLOY_LINES.length) {
        setLines((prev) => [...prev, `> ${DEPLOY_LINES[i]}`]);
      } else {
        clearInterval(interval);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="rounded-xl border border-[#45A29E]/25 bg-black/60 overflow-hidden">
      {active && <AiLoadingBar label="AI deploying your money site" className="px-3 sm:px-4 pt-3 sm:pt-4" />}
      <div className="p-3 sm:p-4 pt-2 font-mono text-[11px] sm:text-xs text-[#45A29E] h-40 sm:h-48 overflow-y-auto">
        {lines.length === 0 ? (
          <p className="text-[#6b7280]">&gt; Awaiting deploy command...</p>
        ) : (
          lines.map((line, idx) => (
            <p key={idx} className="mb-1">
              {line}
            </p>
          ))
        )}
        {active && <span className="inline-block w-2 h-4 bg-[#45A29E] animate-pulse ml-1" />}
      </div>
    </div>
  );
}
