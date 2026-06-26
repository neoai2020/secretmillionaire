"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Loader2, ArrowRight } from "lucide-react";
import { useBlogBuilder } from "../context/BlogBuilderContext";
import { GenerationTerminal } from "../components/GenerationTerminal";

export default function DeployAssetPage() {
  const router = useRouter();
  const {
    linksArmed,
    hobby,
    territory,
    armedLinks,
    isGenerating,
    setGenerating,
    markDeployed,
    appendLog,
  } = useBlogBuilder();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linksArmed) router.replace("/arm-links");
  }, [linksArmed, router]);

  const deploy = async () => {
    setError(null);
    setGenerating(true);

    try {
      appendLog("Creating cash asset record...");
      const createRes = await fetch("/api/blog/create-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby,
          territory,
          armedLinks,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create site");

      const siteId = createData.site.id as string;
      appendLog("Generating pillar + 6 cluster posts...");

      const clusterRes = await fetch("/api/blog/generate-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const clusterData = await clusterRes.json();
      if (!clusterRes.ok) throw new Error(clusterData.error || "Generation failed");

      appendLog(`Created ${clusterData.count} posts. Publishing...`);

      const pubRes = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubData.error || "Publish failed");

      markDeployed(siteId, createData.site.slug);
      router.push("/asset");
    } catch (e) {
      let msg = e instanceof Error ? e.message : "Deploy failed";
      if (msg === "Unauthorized") {
        msg =
          "Not signed in. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for local preview, or sign up at /signup.";
      } else if (msg.toLowerCase().includes("row-level security")) {
        msg =
          "Database blocked the save. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Settings → API → service_role), restart npm run dev, then try again.";
      }
      setError(msg);
      setGenerating(false);
    }
  };

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

      <GenerationTerminal active={isGenerating} />

      {error && (
        <p className="text-sm text-red-400/90 text-center rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          {error}
        </p>
      )}

      <motion.button
        type="button"
        onClick={deploy}
        disabled={isGenerating}
        whileHover={{ scale: isGenerating ? 1 : 1.01 }}
        className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
          boxShadow: "0 0 40px rgba(69, 162, 158, 0.35)",
        }}
      >
        <span className="flex items-center justify-center gap-3">
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={22} />
              Deploying cash asset...
            </>
          ) : (
            <>
              <Rocket size={22} />
              Deploy Money Site Live
              <ArrowRight size={22} />
            </>
          )}
        </span>
      </motion.button>
    </div>
  );
}
