"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";
import { useBlogBuilder } from "../context/BlogBuilderContext";
import { GenerationTerminal } from "../components/GenerationTerminal";
import { DeploySitePreview } from "../components/DeploySitePreview";
import { DeployPostGrid, type PostSlotState } from "../components/DeployPostGrid";
import { PostPreviewModal } from "../components/PostPreviewModal";
import { buildClusterTopics } from "../lib/templates";
import { buildDeploySlots, firstQueuedSlotIndex } from "../lib/deploy-slots";
import { getSiteTerritory } from "../lib/site-territory";
import { POST_GENERATION_ATTEMPTS } from "../lib/generation-pipeline";
import type { ArmedLink, BlogPost, BlogSite } from "../types";

type DeployPhase = "idle" | "setup" | "generating" | "publishing" | "complete" | "error";

/** POST and parse JSON defensively — a busy host can return an HTML timeout page. */
async function postJson(
  url: string,
  body: unknown
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> | null }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

function busyError(status: number): string {
  if (status === 502 || status === 503 || status === 504 || status === 408 || status === 0) {
    return "The server got busy and timed out while writing your articles. Finished posts are saved — click Try Deploy Again to pick up where it left off.";
  }
  return "The server returned an unexpected response. Click Try Deploy Again — finished posts are saved.";
}

interface GenerationQuota {
  limit: number | null;
  usedToday: number;
  remaining: number | null;
  unlimited?: boolean;
}

function linkFingerprint(links: ArmedLink[]): string {
  return links
    .map((l) => l.url.trim())
    .filter(Boolean)
    .sort()
    .join("|");
}

function siteMatchesWizard(
  site: BlogSite,
  hobby: string,
  territory: string,
  armedLinks: ArmedLink[]
): boolean {
  const niche = (territory.trim() || hobby.trim()).toLowerCase();
  const siteNiche = getSiteTerritory(site).trim().toLowerCase();
  const siteLinks = linkFingerprint((site.armed_links ?? []) as ArmedLink[]);
  const currentLinks = linkFingerprint(armedLinks);
  return Boolean(niche) && siteNiche === niche && siteLinks === currentLinks;
}

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
    deployed,
    generationLog,
    setGenerating,
    markDeployed,
    appendLog,
    beginNewSiteGeneration,
  } = useBlogBuilder();

  const [phase, setPhase] = useState<DeployPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [site, setSite] = useState<BlogSite | null>(null);
  const [postSlots, setPostSlots] = useState<PostSlotState[]>([]);
  const [deployLoaded, setDeployLoaded] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const [resumeLabel, setResumeLabel] = useState("");
  const [quota, setQuota] = useState<GenerationQuota | null>(null);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const slotProgressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressCreepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const deployRunning = useRef(false);

  const clearProgressCreepTimer = () => {
    if (progressCreepTimer.current) {
      clearInterval(progressCreepTimer.current);
      progressCreepTimer.current = null;
    }
  };

  const isActiveDeployPhase =
    phase === "setup" || phase === "generating" || phase === "publishing";

  useEffect(() => {
    if (!isActiveDeployPhase) {
      clearProgressCreepTimer();
      return;
    }

    clearProgressCreepTimer();
    progressCreepTimer.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 97) return current;
        const increment = current < 70 ? 0.22 : current < 90 ? 0.12 : 0.05;
        return Math.min(97, current + increment);
      });
    }, 700);

    return clearProgressCreepTimer;
  }, [isActiveDeployPhase]);

  useEffect(() => {
    if (sessionLoaded && !linksArmed) router.replace("/arm-links");
  }, [linksArmed, sessionLoaded, router]);

  useEffect(() => {
    return () => {
      if (slotProgressTimer.current) clearInterval(slotProgressTimer.current);
      clearProgressCreepTimer();
    };
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;

    let cancelled = false;

    async function loadDeployState() {
      try {
        const res = await fetch("/api/blog/deploy-state", { cache: "no-store" });
        const data = res.ok ? await res.json() : null;
        if (cancelled || !data) return;

        if (data.quota) setQuota(data.quota as GenerationQuota);

        const loadedSite = data.site as BlogSite | null;
        const matchesCurrent =
          loadedSite && siteMatchesWizard(loadedSite, hobby, territory, armedLinks);
        const isSessionSite =
          !data.session?.site_id ||
          !loadedSite ||
          data.session.site_id === loadedSite.id;

        if (loadedSite && matchesCurrent && isSessionSite) {
          setSite(loadedSite);
          if (Array.isArray(data.slots) && data.slots.length > 0) {
            setPostSlots(data.slots as PostSlotState[]);
          }

          const completed = data.completedCount ?? 0;
          const total = data.totalCount ?? 0;

          if (data.session?.deployed) {
            setPhase("complete");
            setProgress(100);
          } else if (deployed) {
            setPhase("complete");
            setProgress(100);
          } else if (total > 0 && completed === total && !data.session?.deployed) {
            setCanResume(true);
            setResumeLabel(`Publish money site (${completed}/${total} posts ready)`);
          } else if (data.canResume) {
            setCanResume(true);
            setResumeLabel(`Continue deployment (${completed}/${total} posts ready)`);
          }
        }
      } finally {
        if (!cancelled) setDeployLoaded(true);
      }
    }

    loadDeployState();
    return () => {
      cancelled = true;
    };
  }, [sessionLoaded, deployed, hobby, territory, armedLinks]);

  const prepareFreshDeploy = () => {
    beginNewSiteGeneration();
    setPhase("idle");
    setSite(null);
    setPostSlots([]);
    setCanResume(false);
    setError(null);
    setProgress(0);
  };

  const bumpProgress = (target: number) => {
    setProgress((current) => Math.max(current, target));
  };

  const clearSlotProgressTimer = () => {
    if (slotProgressTimer.current) {
      clearInterval(slotProgressTimer.current);
      slotProgressTimer.current = null;
    }
  };

  const startSlotsProgress = () => {
    if (slotProgressTimer.current) return;
    slotProgressTimer.current = setInterval(() => {
      setPostSlots((prev) =>
        prev.map((s) => {
          if (s.status !== "generating") return s;
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
    startSlotsProgress();
  };

  const setSlotComplete = (index: number, post: BlogPost) => {
    setPostSlots((prev) => {
      const next = prev.map((s, idx) =>
        idx === index ? { ...s, status: "complete" as const, progress: 100, post } : s
      );
      if (!next.some((s) => s.status === "generating")) {
        clearSlotProgressTimer();
      }
      return next;
    });
  };

  const setSlotError = (index: number, message: string) => {
    clearSlotProgressTimer();
    setPostSlots((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: "error", error: message } : s))
    );
  };

  const updatePostInSlots = (updated: BlogPost) => {
    setPostSlots((prev) =>
      prev.map((s) =>
        s.post?.id === updated.id ? { ...s, post: updated } : s
      )
    );
  };

  const attachImagesInBackground = useCallback((posts: BlogPost[]) => {
    const needsImage = posts.filter((p) => !p.image_url);
    if (needsImage.length === 0) return;

    appendLog(`Adding ${needsImage.length} hero images in the background...`);

    void Promise.allSettled(
      needsImage.map(async (post) => {
        const res = await fetch(`/api/blog/posts/${post.id}/image`, { method: "POST" });
        const data = await res.json();
        if (res.ok && data.post) {
          updatePostInSlots(data.post as BlogPost);
        }
      })
    );
  }, [appendLog]);

  const runPostGeneration = useCallback(
    async (params: {
      siteId: string;
      topics: ReturnType<typeof buildClusterTopics>;
      productContext: string;
      startIndex?: number;
    }) => {
      const { siteId, topics, productContext, startIndex = 0 } = params;
      const pending = topics.slice(startIndex).map((_, offset) => startIndex + offset);

      if (pending.length === 0) return [];

      pending.forEach((i) => setSlotGenerating(i));
      appendLog(`Writing ${pending.length} articles on server (text first, images after publish)...`);
      bumpProgress(25);

      const { ok: batchOk, status: batchStatus, data: batchData } = await postJson(
        "/api/blog/generate-deploy-batch",
        { siteId, productContext, startIndex }
      );

      if (!batchOk || !batchData) {
        throw new Error((batchData?.error as string) || busyError(batchStatus));
      }

      const results = (Array.isArray(batchData.results) ? batchData.results : []) as Array<{
        index: number;
        post?: BlogPost;
        error?: string;
      }>;
      let finished = 0;

      for (const row of results) {
        const i = typeof row.index === "number" ? row.index : -1;
        if (i < 0) continue;

        if (row.post) {
          setSlotComplete(i, row.post as BlogPost);
          finished += 1;
          bumpProgress(20 + Math.round((finished / topics.length) * 65));
        } else if (row.error) {
          setSlotError(i, String(row.error));
        }
      }

      const failures = Array.isArray(batchData.failures) ? batchData.failures : [];
      if (failures.length > 0) {
        clearSlotProgressTimer();
        throw new Error(
          `${failures.length} article${failures.length === 1 ? "" : "s"} failed after ${POST_GENERATION_ATTEMPTS} tries. Click Try Deploy Again to resume.`
        );
      }

      clearSlotProgressTimer();
      bumpProgress(85);

      const posts = results.filter((r) => r.post).map((r) => r.post as BlogPost);
      return posts;
    },
    [appendLog]
  );

  const publishSite = async (siteId: string, siteSlug: string) => {
    setPhase("publishing");
    bumpProgress(92);
    appendLog("Publishing money site live...");

    const { ok: pubOk, status: pubStatus, data: pubData } = await postJson(
      "/api/blog/publish",
      { siteId }
    );
    if (!pubOk) throw new Error((pubData?.error as string) || busyError(pubStatus));

    bumpProgress(100);
    appendLog("Money site is live — traffic routing enabled.");
    markDeployed(siteId, siteSlug);
    setPhase("complete");
    setCanResume(false);
    setGenerating(false);
  };

  const deploy = async (resume = false) => {
    if (deployRunning.current) return;
    deployRunning.current = true;

    setError(null);
    setCanResume(false);
    setGenerating(true);

    const niche = territory.trim() || hobby.trim();
    if (!niche) {
      setError("Missing territory — go back to Choose Territory and pick a niche first.");
      setPhase("error");
      setGenerating(false);
      deployRunning.current = false;
      return;
    }

    if (armedLinks.length === 0) {
      setError("No armed links found — go back to Arm Your Links and add at least one affiliate URL.");
      setPhase("error");
      setGenerating(false);
      deployRunning.current = false;
      return;
    }

    try {
      let activeSite = site;
      let activeSlots = postSlots;
      let startIndex = 0;
      let productContext = "";

      if (resume && activeSite) {
        const deployTerritory = getSiteTerritory(activeSite);
        const deployHobby = activeSite.hobby || hobby.trim() || niche;
        const topics = buildClusterTopics(deployTerritory, deployHobby);
        activeSlots =
          activeSlots.length > 0 ? activeSlots : buildDeploySlots(activeSite, []);
        startIndex = firstQueuedSlotIndex(activeSlots);
        if (startIndex === -1) {
          await publishSite(activeSite.id, activeSite.slug);
          deployRunning.current = false;
          return;
        }
        setPostSlots(activeSlots);
        setPhase("generating");
        bumpProgress(20 + Math.round((startIndex / topics.length) * 65));
        appendLog(`Resuming from post ${startIndex + 1}/${topics.length}...`);

        const affiliateUrl = armedLinks[0]?.url;
        if (affiliateUrl) {
          try {
            const scrapeRes = await fetch("/api/blog/scrape", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: affiliateUrl }),
            });
            const scrapeData = await scrapeRes.json();
            if (scrapeRes.ok && (scrapeData.context || scrapeData.data)) {
              productContext =
                scrapeData.context ||
                `${scrapeData.data.title}. ${scrapeData.data.description}`;
            }
          } catch {
            // Non-fatal
          }
        }

        const generatedPosts = await runPostGeneration({
          siteId: activeSite.id,
          topics,
          productContext,
          startIndex,
        });

        appendLog(
          generatedPosts.length > 0
            ? `Created ${generatedPosts.length} new posts. Publishing...`
            : "All posts ready. Publishing..."
        );
        await publishSite(activeSite.id, activeSite.slug);
        attachImagesInBackground(generatedPosts);
        deployRunning.current = false;
        return;
      }

      setPhase("setup");
      setProgress(0);
      setSite(null);
      setPostSlots([]);
      beginNewSiteGeneration();

      appendLog("Creating cash asset record...");
      bumpProgress(8);

      const { ok: createOk, status: createStatus, data: createData } = await postJson(
        "/api/blog/create-site",
        { hobby: hobby.trim() || niche, territory: niche, armedLinks }
      );
      if (!createOk || !createData) {
        throw new Error((createData?.error as string) || busyError(createStatus));
      }
      if (createData.quota) setQuota(createData.quota as GenerationQuota);

      activeSite = createData.site as BlogSite;
      setSite(activeSite);
      bumpProgress(15);

      const deployTerritory = getSiteTerritory(activeSite);
      const deployHobby = activeSite.hobby || hobby.trim() || niche;
      const topics = buildClusterTopics(deployTerritory, deployHobby);
      activeSlots = initSlots(topics);
      setPostSlots(activeSlots);

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
          if (scrapeRes.ok && (scrapeData.context || scrapeData.data)) {
            productContext =
              scrapeData.context ||
              `${scrapeData.data.title}. ${scrapeData.data.description}`;
          }
        } catch {
          // Non-fatal
        }
      }

      bumpProgress(20);
      appendLog("Site ready — generating posts in pipeline...");
      setPhase("generating");

      const generatedPosts = await runPostGeneration({
        siteId: activeSite.id,
        topics,
        productContext,
        startIndex: 0,
      });

      appendLog(
        generatedPosts.length > 0
          ? `Created ${generatedPosts.length} new posts. Publishing...`
          : "All posts ready. Publishing..."
      );
      await publishSite(activeSite.id, activeSite.slug);
      attachImagesInBackground(generatedPosts);
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
    } finally {
      deployRunning.current = false;
    }
  };

  if (!sessionLoaded || !deployLoaded) {
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
  const showResults =
    site &&
    (phase === "generating" ||
      phase === "publishing" ||
      phase === "complete" ||
      (phase === "idle" && canResume) ||
      (phase === "error" && postSlots.length > 0));

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Click 3</p>
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-[#C5C6C7] tracking-tight">
          Deploy Asset
        </h1>
        <p className="text-[#6b7280] text-sm sm:text-base max-w-2xl leading-relaxed">
          The system will generate your pillar post, six cluster articles, images, SEO metadata, and
          weave in your armed links — then publish your money site live. All progress is saved to
          your account on our servers — nothing is stored in your browser.
        </p>
        {quota && (
          <p className="text-xs text-[#45A29E]/90">
            {quota.unlimited ? (
              <>Unlimited money sites · {quota.usedToday} generated today.</>
            ) : (
              <>
                {quota.remaining} of {quota.limit} new money sites remaining today (
                {quota.usedToday} generated).
              </>
            )}
          </p>
        )}
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
              active
            />
          )}

          {postSlots.length > 0 && (
            <DeployPostGrid slots={postSlots} onViewPost={setPreviewPostId} />
          )}

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

      {phase === "idle" && !canResume && (
        <GenerationTerminal phase="idle" progress={0} logLines={generationLog} />
      )}

      {phase === "idle" && canResume && (
        <motion.button
          type="button"
          onClick={() => deploy(true)}
          whileHover={{ scale: 1.01 }}
          className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10]"
          style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #b8942a 100%)",
            boxShadow: "0 0 40px rgba(212, 175, 55, 0.35)",
          }}
        >
          <span className="flex items-center justify-center gap-3">
            <RotateCcw size={20} />
            {resumeLabel || "Continue Deployment"}
          </span>
        </motion.button>
      )}

      {phase === "idle" && !canResume && (
        <motion.button
          type="button"
          onClick={() => deploy(false)}
          disabled={!quota?.unlimited && quota !== null && (quota.remaining ?? 0) <= 0}
          whileHover={{ scale: !quota?.unlimited && quota !== null && (quota.remaining ?? 0) <= 0 ? 1 : 1.01 }}
          className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] disabled:opacity-50 disabled:cursor-not-allowed"
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

      {phase === "complete" && quota && (quota.unlimited || (quota.remaining ?? 0) > 0) && (
        <motion.button
          type="button"
          onClick={() => {
            prepareFreshDeploy();
            router.push("/territory");
          }}
          whileHover={{ scale: 1.01 }}
          className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] border border-[#D4AF37]/40"
          style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #b8942a 100%)",
            boxShadow: "0 0 40px rgba(212, 175, 55, 0.25)",
          }}
        >
          <span className="flex items-center justify-center gap-3">
            <Rocket size={20} />
            {quota.unlimited
              ? "Generate Another Site"
              : `Generate Another Site (${quota.remaining} left today)`}
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
            View Asset Vault
            <ArrowRight size={22} />
          </span>
        </motion.button>
      )}

      {phase === "error" && (
        <motion.button
          type="button"
          onClick={() => deploy(canResume || postSlots.some((s) => s.status === "complete"))}
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

      <PostPreviewModal
        postId={previewPostId}
        onClose={() => setPreviewPostId(null)}
        onSaved={updatePostInSlots}
      />
    </div>
  );
}
