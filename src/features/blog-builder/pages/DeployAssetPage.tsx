"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";
import { useBlogBuilder } from "../context/BlogBuilderContext";
import { GenerationTerminal } from "../components/GenerationTerminal";
import { DeploySitePreview } from "../components/DeploySitePreview";
import { DeployPostGrid, type PostSlotState } from "../components/DeployPostGrid";
import { buildClusterTopics } from "../lib/templates";
import type { BlogPost, BlogSite } from "../types";

type DeployPhase = "idle" | "setup" | "generating" | "publishing" | "complete" | "error";

function initSlots(topics: ReturnType<typeof buildClusterTopics>): PostSlotState[] {
  return topics.map((topic) => ({
    topic,
    status: "queued",
    progress: 0,
  }));
}

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
  const [site, setSite] = useState<BlogSite | null>(null);
  const [postSlots, setPostSlots] = useState<PostSlotState[]>([]);
  const slotProgressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sessionLoaded && !linksArmed) router.replace("/arm-links");
  }, [linksArmed, sessionLoaded, router]);

  useEffect(() => {
    return () => {
      if (slotProgressTimer.current) clearInterval(slotProgressTimer.current);
    };
  }, []);

  const bumpProgress = (target: number) => {
    setProgress((current) => Math.max(current, target));
  };

  const clearSlotProgressTimer = () => {
    if (slotProgressTimer.current) {
      clearInterval(slotProgressTimer.current);
      slotProgressTimer.current = null;
    }
  };

  const startSlotProgress = (index: number) => {
    clearSlotProgressTimer();
    slotProgressTimer.current = setInterval(() => {
      setPostSlots((prev) =>
        prev.map((s, idx) => {
          if (idx !== index || s.status !== "generating") return s;
          const next = s.progress + 1.5 + Math.random() * 2.5;
          return { ...s, progress: Math.min(94, next) };
        })
      );
    }, 700);
  };

  const setSlotGenerating = (index: number) => {
    setPostSlots((prev) =>
      prev.map((s, idx) =>
        idx === index ? { ...s, status: "generating", progress: 4, error: undefined } : s
      )
    );
    startSlotProgress(index);
  };

  const setSlotComplete = (index: number, post: BlogPost) => {
    clearSlotProgressTimer();
    setPostSlots((prev) =>
      prev.map((s, idx) =>
        idx === index ? { ...s, status: "complete", progress: 100, post } : s
      )
    );
  };

  const setSlotError = (index: number, message: string) => {
    clearSlotProgressTimer();
    setPostSlots((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: "error", error: message } : s))
    );
  };

  const deploy = async () => {
    setError(null);
    setPhase("setup");
    setProgress(0);
    setSite(null);
    setPostSlots([]);
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

      const createdSite = createData.site as BlogSite;
      setSite(createdSite);
      bumpProgress(15);

      const deployHobby = createdSite.hobby || hobby.trim() || niche;
      const topics = buildClusterTopics(deployHobby);
      const slots = initSlots(topics);
      setPostSlots(slots);

      let productContext = "";
      const affiliateUrl = armedLinks[0]?.url;
      if (affiliateUrl) {
        appendLog("Scanning affiliate offer page...");
        try {
          const scrapeRes = await fetch("/api/blog/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: affiliateUrl }),
          });
          const scrapeData = await scrapeRes.json();
          if (scrapeRes.ok && scrapeData.data) {
            productContext = `${scrapeData.data.title}. ${scrapeData.data.description}`;
          }
        } catch {
          // Non-fatal
        }
      }

      bumpProgress(20);
      appendLog("Site ready — generating posts in pipeline...");
      setPhase("generating");

      const siteId = createdSite.id;
      let createdCount = 0;

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        appendLog(`Writing ${i + 1}/${topics.length}: ${topic.title}...`);
        setSlotGenerating(i);

        const overallPct = 20 + Math.round((i / topics.length) * 65);
        bumpProgress(overallPct);

        const postRes = await fetch("/api/blog/generate-one-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId,
            topic,
            productContext,
            fastImages: true,
          }),
        });
        const postData = await postRes.json();

        if (!postRes.ok) {
          setSlotError(i, postData.error || "Generation failed");
          throw new Error(postData.error || `Failed on post ${i + 1}`);
        }

        setSlotComplete(i, postData.post as BlogPost);
        if (!postData.skipped) createdCount++;
        bumpProgress(20 + Math.round(((i + 1) / topics.length) * 65));
      }

      setPhase("publishing");
      bumpProgress(92);
      appendLog(
        createdCount > 0
          ? `Created ${createdCount} new posts. Publishing...`
          : "All posts ready. Publishing..."
      );

      const pubRes = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubData.error || "Publish failed");

      bumpProgress(100);
      appendLog("Money site is live — traffic routing enabled.");
      markDeployed(siteId, createdSite.slug);
      setPhase("complete");
      setGenerating(false);
    } catch (e) {
      clearSlotProgressTimer();
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
    phase === "complete"
      ? "complete"
      : phase === "setup"
        ? "running"
        : phase === "generating" || phase === "publishing"
          ? "running"
          : "idle";

  const completedPosts = postSlots.filter((s) => s.status === "complete").length;
  const showResults = site && (phase === "generating" || phase === "publishing" || phase === "complete");

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

      {phase === "setup" && (
        <GenerationTerminal phase={terminalPhase} progress={progress} logLines={generationLog} />
      )}

      {showResults && site && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-6"
        >
          <DeploySitePreview site={site} />

          {(phase === "generating" || phase === "publishing") && (
            <AiLoadingBar
              label={
                phase === "publishing"
                  ? "Publishing money site live"
                  : `Generating content — ${completedPosts}/${postSlots.length} posts`
              }
              progress={progress}
            />
          )}

          {postSlots.length > 0 && <DeployPostGrid slots={postSlots} />}

          {phase === "publishing" && (
            <div className="rounded-xl border border-[#45A29E]/25 bg-black/40 p-4 font-mono text-xs text-[#45A29E]">
              {generationLog.slice(-3).map((line, idx) => (
                <p key={`${line}-${idx}`} className="mb-1">
                  {line.startsWith(">") ? line : `> ${line}`}
                </p>
              ))}
              <span className="inline-block w-2 h-4 bg-[#45A29E] animate-pulse ml-1" />
            </div>
          )}
        </motion.div>
      )}

      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <CheckCircle2 className="text-[#45A29E]" size={28} />
          <p className="text-sm text-[#C5C6C7]">Your money site is live and ready for traffic.</p>
          <AiLoadingBar label="Deploy complete" progress={100} className="w-full max-w-md" />
        </motion.div>
      )}

      {error && (
        <p className="text-sm text-red-400/90 text-center rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          {error}
        </p>
      )}

      {phase === "idle" && (
        <GenerationTerminal phase="idle" progress={0} logLines={generationLog} />
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
