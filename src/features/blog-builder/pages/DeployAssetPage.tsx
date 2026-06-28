"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { useBlogBuilder } from "../context/BlogBuilderContext";
import { GenerationTerminal } from "../components/GenerationTerminal";

type DeployPhase = "idle" | "deploying" | "complete" | "error";

export default function DeployAssetPage() {
  const router = useRouter();
  const {
    sessionLoaded,
    linksArmed,
    hobby,
    territory,
    armedLinks,
    generationLog,
    setGenerating,
    markDeployed,
    appendLog,
  } = useBlogBuilder();

  const [phase, setPhase] = useState<DeployPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sessionLoaded && !linksArmed) router.replace("/arm-links");
  }, [linksArmed, sessionLoaded, router]);

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  const bumpProgress = (target: number) => {
    setProgress((current) => Math.max(current, target));
  };

  const startCreep = (from: number, to: number) => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setProgress((current) => {
        if (current >= to) return current;
        return Math.min(to, current + 1);
      });
    }, 1800);
  };

  const stopCreep = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const deploy = async () => {
    setError(null);
    setPhase("deploying");
    setProgress(0);
    setGenerating(true);

    const niche = territory.trim() || hobby.trim();
    if (!niche) {
      setError("Missing territory — go back to Choose Territory and pick a niche first.");
      setPhase("error");
      setGenerating(false);
      return;
    }

    if (armedLinks.length === 0) {
      setError("No armed links found — go back to Arm Your Links and add at least one affiliate URL.");
      setPhase("error");
      setGenerating(false);
      return;
    }

    try {
      appendLog("Creating cash asset record...");
      bumpProgress(8);

      const createRes = await fetch("/api/blog/create-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby: hobby.trim() || niche,
          territory: niche,
          armedLinks,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create site");

      bumpProgress(22);
      appendLog("Generating pillar + 6 cluster posts...");
      startCreep(22, 82);

      const clusterRes = await fetch("/api/blog/generate-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: createData.site.id as string }),
      });
      const clusterData = await clusterRes.json();
      stopCreep();
      if (!clusterRes.ok) throw new Error(clusterData.error || "Generation failed");

      bumpProgress(88);
      appendLog(`Created ${clusterData.count} posts. Publishing...`);

      const pubRes = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: createData.site.id as string }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubData.error || "Publish failed");

      bumpProgress(100);
      appendLog("Money site is live — traffic routing enabled.");
      markDeployed(createData.site.id as string, createData.site.slug as string);
      setPhase("complete");
      setGenerating(false);
    } catch (e) {
      stopCreep();
      let msg = e instanceof Error ? e.message : "Deploy failed";
      if (msg === "Unauthorized") {
        msg = "Not signed in. Please log in at /login and try again.";
      } else if (msg.toLowerCase().includes("row-level security")) {
        msg = "Database blocked the save. Contact support if this persists after logging in.";
      }
      appendLog(`Error: ${msg}`);
      setError(msg);
      setPhase("error");
      setGenerating(false);
    }
  };

  if (!sessionLoaded) {
    return <p className="text-[#6b7280] text-sm animate-pulse">Loading your deploy session...</p>;
  }

  const terminalPhase =
    phase === "complete" ? "complete" : phase === "deploying" ? "running" : "idle";

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Click 3</p>
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-[#C5C6C7] tracking-tight">
          Deploy Asset
        </h1>
        <p className="text-[#6b7280] text-sm sm:text-base max-w-2xl leading-relaxed">
          The system will generate your pillar post, six cluster articles, images, SEO metadata, and
          weave in your armed links — then publish your money site live.
        </p>
      </div>

      <GenerationTerminal phase={terminalPhase} progress={progress} logLines={generationLog} />

      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <CheckCircle2 className="text-[#45A29E]" size={28} />
          <p className="text-sm text-[#C5C6C7]">Your money site is live and ready for traffic.</p>
        </motion.div>
      )}

      {error && (
        <p className="text-sm text-red-400/90 text-center rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          {error}
        </p>
      )}

      {phase === "idle" && (
        <motion.button
          type="button"
          onClick={deploy}
          whileHover={{ scale: 1.01 }}
          className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10]"
          style={{
            background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
            boxShadow: "0 0 40px rgba(69, 162, 158, 0.35)",
          }}
        >
          <span className="flex items-center justify-center gap-3">
            <Rocket size={22} />
            Deploy Money Site Live
            <ArrowRight size={22} />
          </span>
        </motion.button>
      )}

      {phase === "complete" && (
        <motion.button
          type="button"
          onClick={() => router.push("/asset")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10]"
          style={{
            background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
            boxShadow: "0 0 40px rgba(69, 162, 158, 0.35)",
          }}
        >
          <span className="flex items-center justify-center gap-3">
            View Asset Command
            <ArrowRight size={22} />
          </span>
        </motion.button>
      )}

      {phase === "error" && (
        <motion.button
          type="button"
          onClick={deploy}
          whileHover={{ scale: 1.01 }}
          className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] border border-[#45A29E]/40"
          style={{
            background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
          }}
        >
          <span className="flex items-center justify-center gap-3">
            <RotateCcw size={20} />
            Try Deploy Again
          </span>
        </motion.button>
      )}
    </div>
  );
}
