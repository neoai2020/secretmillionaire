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

type TerminalPhase = "idle" | "running" | "complete";

interface GenerationTerminalProps {
  phase: TerminalPhase;
  progress?: number;
  logLines?: string[];
}

export function GenerationTerminal({ phase, progress, logLines = [] }: GenerationTerminalProps) {
  const [animatedLines, setAnimatedLines] = useState<string[]>([]);

  useEffect(() => {
    if (phase !== "running") {
      setAnimatedLines([]);
      return;
    }

    let i = 0;
    setAnimatedLines([`> ${DEPLOY_LINES[0]}`]);
    const interval = setInterval(() => {
      i += 1;
      if (i < DEPLOY_LINES.length) {
        setAnimatedLines((prev) => [...prev, `> ${DEPLOY_LINES[i]}`]);
      } else {
        clearInterval(interval);
      }
    }, 1400);

    return () => clearInterval(interval);
  }, [phase]);

  const apiLines = logLines.map((line) => (line.startsWith(">") ? line : `> ${line}`));
  const displayLines =
    apiLines.length > 0 ? apiLines : phase === "running" ? animatedLines : [];

  return (
    <div className="rounded-xl border border-[#45A29E]/25 bg-black/60 overflow-hidden">
      {phase === "running" && (
        <AiLoadingBar
          label="AI building your website"
          progress={progress}
          active={phase === "running"}
          className="px-3 sm:px-4 pt-3 sm:pt-4"
        />
      )}
      {phase === "complete" && (
        <AiLoadingBar label="Deploy complete" progress={100} className="px-3 sm:px-4 pt-3 sm:pt-4" />
      )}
      <div className="p-3 sm:p-4 pt-2 font-mono text-[11px] sm:text-xs text-[#45A29E] h-40 sm:h-48 overflow-y-auto">
        {phase === "idle" && (
          <p className="text-[#6b7280]">&gt; Ready to launch. Click below to put your website online.</p>
        )}
        {phase === "complete" && displayLines.length === 0 && (
          <p className="text-[#45A29E]">&gt; Money site is live — traffic routing enabled.</p>
        )}
        {displayLines.map((line, idx) => (
          <p key={`${line}-${idx}`} className="mb-1">
            {line}
          </p>
        ))}
        {phase === "running" && (
          <span className="inline-block w-2 h-4 bg-[#45A29E] animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}
