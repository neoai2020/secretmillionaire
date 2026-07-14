"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { TEXT_GENERATION_CONCURRENCY } from "../lib/generation-pipeline";
import type { ArmedLink, BlogPost, BlogSite } from "../types";

interface PrefetchedImage {
  url: string;
  alt: string;
  stockId?: string;
}

const DEPLOY_TEXT_WAVE_SIZE = 3;

const DEPLOY_LOADING_STEPS = [
  "Scanning your affiliate offer page…",
  "Mapping keyword clusters for your niche…",
  "Gathering trending angles in your territory…",
  "Prefetching unique hero images…",
  "AI is writing your pillar guide…",
  "Weaving affiliate links into the copy…",
  "Crafting SEO titles and meta descriptions…",
  "Drafting supporting cluster articles…",
  "Selecting distinct photos for each post…",
  "Building internal links between articles…",
  "Polishing your first article for publish…",
];

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

function deployProgress(completed: number, total: number, slotProgress = 0): number {
  if (total <= 0) return 0;
  const base = 20 + (completed / total) * 70;
  const slotShare = slotProgress / total;
  return Math.min(92, Math.round(base + slotShare * 0.7));
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
    deployArmedLinks,
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
  const [loadingStep, setLoadingStep] = useState(0);
  const slotProgressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressCreepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const deployRunning = useRef(false);

  const clearProgressCreepTimer = () => {
    if (progressCreepTimer.current) {
      clearInterval(progressCreepTimer.current);
      progressCreepTimer.current = null;
    }
  };

  const isSetupPhase = phase === "setup";

  useEffect(() => {
    if (!isSetupPhase) {
      clearProgressCreepTimer();
      return;
    }

    clearProgressCreepTimer();
    progressCreepTimer.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 18) return current;
        return Math.min(18, current + 0.35);
      });
    }, 700);

    return clearProgressCreepTimer;
  }, [isSetupPhase]);

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
          loadedSite && siteMatchesWizard(loadedSite, hobby, territory, deployArmedLinks);
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
  }, [sessionLoaded, deployed, hobby, territory, deployArmedLinks]);

  const pillarSlot = useMemo(
    () => postSlots.find((s) => s.topic.isPillar) ?? postSlots[0],
    [postSlots]
  );

  const firstPostReady = Boolean(
    pillarSlot?.status === "complete" &&
      pillarSlot.post?.image_url &&
      pillarSlot.post.html
  );

  const bootstrapping =
    phase === "setup" || (phase === "generating" && !firstPostReady);

  useEffect(() => {
    if (!bootstrapping) return;

    setLoadingStep(0);
    const timer = setInterval(() => {
      setLoadingStep((step) => (step + 1) % DEPLOY_LOADING_STEPS.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [bootstrapping]);

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

  const activeSlotIndex = useRef<number | null>(null);

  const clearSlotProgressTimer = () => {
    if (slotProgressTimer.current) {
      clearInterval(slotProgressTimer.current);
      slotProgressTimer.current = null;
    }
    activeSlotIndex.current = null;
  };

  const startActiveSlotProgress = (index: number, completed: number, total: number) => {
    clearSlotProgressTimer();
    activeSlotIndex.current = index;
    slotProgressTimer.current = setInterval(() => {
      setPostSlots((prev) =>
        prev.map((s, idx) => {
          if (idx !== index || s.status !== "generating") return s;
          const next = s.progress + 0.8 + Math.random() * 1.2;
          const capped = Math.min(88, next);
          setProgress(deployProgress(completed, total, capped));
          return { ...s, progress: capped };
        })
      );
    }, 900);
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

  const attachSiteImagesBatch = useCallback(
    async (
      posts: BlogPost[],
      topics: ReturnType<typeof buildClusterTopics>,
      cache: Record<string, PrefetchedImage>,
      seed?: { excludeUrls: string[]; excludeStockIds: string[] }
    ): Promise<{ excludeUrls: string[]; excludeStockIds: string[] } | undefined> => {
      const needsImage = posts.filter((p) => !p.image_url);
      if (needsImage.length === 0) return seed;

      appendLog(`Adding images for ${needsImage.length} post${needsImage.length === 1 ? "" : "s"}...`);

      const { ok, data } = await postJson("/api/blog/attach-site-images", {
        seed,
        items: needsImage.map((post) => {
          const topicIndex = topics.findIndex((t) => t.slug === post.slug);
          return {
            postId: post.id,
            prefetched: cache[post.slug] ?? null,
            postIndex: topicIndex >= 0 ? topicIndex : 0,
          };
        }),
      });

      if (ok && data?.posts && Array.isArray(data.posts)) {
        for (const updated of data.posts as BlogPost[]) {
          updatePostInSlots(updated);
        }
        const attached = typeof data.attached === "number" ? data.attached : needsImage.length;
        appendLog(`Images ready: ${attached}/${needsImage.length}.`);
        const pool = data.pool as { excludeUrls?: string[]; excludeStockIds?: string[] } | undefined;
        if (pool) {
          return {
            excludeUrls: Array.isArray(pool.excludeUrls) ? pool.excludeUrls : [],
            excludeStockIds: Array.isArray(pool.excludeStockIds) ? pool.excludeStockIds : [],
          };
        }
      }

      return seed;
    },
    [appendLog]
  );

  const attachImagesInBackground = useCallback(
    (posts: BlogPost[], topics: ReturnType<typeof buildClusterTopics>) => {
      void attachSiteImagesBatch(posts, topics, {});
    },
    [attachSiteImagesBatch]
  );

  const setWaveGenerating = (indices: number[], completedBefore: number, total: number) => {
    setPostSlots((prev) =>
      prev.map((s, idx) => {
        if (indices.includes(idx)) {
          return { ...s, status: "generating", progress: 6, error: undefined };
        }
        return s;
      })
    );
    if (indices.length > 0) {
      setProgress(deployProgress(completedBefore, total, 6));
      startActiveSlotProgress(indices[0], completedBefore, total);
    }
  };

  const runPostGeneration = useCallback(
    async (params: {
      siteId: string;
      topics: ReturnType<typeof buildClusterTopics>;
      productContext: string;
      deployTerritory: string;
      deployHobby: string;
      startIndex?: number;
    }) => {
      const {
        siteId,
        topics,
        productContext,
        deployTerritory,
        deployHobby,
        startIndex = 0,
      } = params;

      if (startIndex >= topics.length) return [];

      let trendContext = "";
      try {
        appendLog("Gathering niche trend angles...");
        const { ok, data } = await postJson("/api/blog/trend-angles", {
          territory: deployTerritory,
          hobby: deployHobby,
        });
        if (ok && data && typeof data.trendContext === "string") {
          trendContext = data.trendContext;
        }
      } catch {
        // Non-fatal
      }

      appendLog(
        `Writing ${topics.length - startIndex} articles — hero images prefetch in parallel...`
      );
      bumpProgress(22);

      const imagePrefetchPromise = postJson("/api/blog/prefetch-images", {
        topics,
        territory: deployTerritory,
        hobby: deployHobby,
      }).then((res) => {
        if (res.ok && res.data?.images && typeof res.data.images === "object") {
          const count = Object.keys(res.data.images as object).length;
          appendLog(`Hero images prefetched: ${count}/${topics.length}.`);
          return res.data.images as Record<string, PrefetchedImage>;
        }
        appendLog("Image prefetch skipped — will attach per post.");
        return {} as Record<string, PrefetchedImage>;
      });

      const generatedPosts: BlogPost[] = [];
      let imagePoolSeed: { excludeUrls: string[]; excludeStockIds: string[] } | undefined;

      for (let waveStart = startIndex; waveStart < topics.length; waveStart += DEPLOY_TEXT_WAVE_SIZE) {
        const waveEnd = Math.min(waveStart + DEPLOY_TEXT_WAVE_SIZE, topics.length);
        const waveIndices = Array.from(
          { length: waveEnd - waveStart },
          (_, offset) => waveStart + offset
        );

        setWaveGenerating(waveIndices, waveStart, topics.length);
        appendLog(
          `Writing posts ${waveStart + 1}–${waveEnd} in parallel (${TEXT_GENERATION_CONCURRENCY} at a time on server)...`
        );

        const { ok: batchOk, status: batchStatus, data: batchData } = await postJson(
          "/api/blog/generate-deploy-batch",
          {
            siteId,
            productContext,
            trendContext,
            startIndex: waveStart,
            limit: waveEnd - waveStart,
          }
        );

        if (!batchOk || !batchData) {
          throw new Error((batchData?.error as string) || busyError(batchStatus));
        }

        const results = (Array.isArray(batchData.results) ? batchData.results : []) as Array<{
          index: number;
          post?: BlogPost;
          error?: string;
        }>;

        const wavePosts: BlogPost[] = [];
        const imageCache = await imagePrefetchPromise;

        for (const row of results) {
          const i = typeof row.index === "number" ? row.index : -1;
          if (i < 0) continue;

          if (row.post) {
            const post = row.post as BlogPost;
            setSlotComplete(i, post);
            generatedPosts.push(post);
            wavePosts.push(post);
            appendLog(`Post ${i + 1}/${topics.length} saved.`);
          } else if (row.error) {
            setSlotError(i, String(row.error));
          }
        }

        if (wavePosts.length > 0) {
          const byIndex = [...wavePosts].sort((a, b) => {
            const ia = topics.findIndex((t) => t.slug === a.slug);
            const ib = topics.findIndex((t) => t.slug === b.slug);
            return ia - ib;
          });

          for (const post of byIndex) {
            imagePoolSeed = await attachSiteImagesBatch(
              [post],
              topics,
              imageCache,
              imagePoolSeed
            );
          }
        }

        setProgress(deployProgress(waveEnd, topics.length));

        const failures = Array.isArray(batchData.failures) ? batchData.failures : [];
        if (failures.length > 0) {
          clearSlotProgressTimer();
          throw new Error(
            `${failures.length} article${failures.length === 1 ? "" : "s"} failed in this batch. Click Try Deploy Again to resume.`
          );
        }
      }

      clearSlotProgressTimer();
      bumpProgress(90);

      return generatedPosts;
    },
    [appendLog, attachSiteImagesBatch]
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
      setError("Missing topic — go back to Step 1 and pick a topic first.");
      setPhase("error");
      setGenerating(false);
      deployRunning.current = false;
      return;
    }

    if (deployArmedLinks.length === 0 && !resume) {
      setError("No product links found — go back to Step 2 and add at least one product link.");
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

        const affiliateUrl = deployArmedLinks[0]?.url;
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
              appendLog(
                scrapeData.cached ? "Offer page loaded from cache." : "Offer page scanned."
              );
            }
          } catch {
            // Non-fatal
          }
        }

        const generatedPosts = await runPostGeneration({
          siteId: activeSite.id,
          topics,
          productContext,
          deployTerritory,
          deployHobby,
          startIndex,
        });

        appendLog(
          generatedPosts.length > 0
            ? `Created ${generatedPosts.length} new posts. Publishing...`
            : "All posts ready. Publishing..."
        );
        await publishSite(activeSite.id, activeSite.slug);
        attachImagesInBackground(generatedPosts, topics);
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
        { hobby: hobby.trim() || niche, territory: niche, armedLinks: deployArmedLinks }
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

      const affiliateUrl = deployArmedLinks[0]?.url;
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
            appendLog(
              scrapeData.cached ? "Offer page loaded from cache." : "Offer page scanned."
            );
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
        deployTerritory,
        deployHobby,
        startIndex: 0,
      });

      appendLog(
        generatedPosts.length > 0
          ? `Created ${generatedPosts.length} new posts. Publishing...`
          : "All posts ready. Publishing..."
      );
      await publishSite(activeSite.id, activeSite.slug);
      attachImagesInBackground(generatedPosts, topics);
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
  const postsWithImages = postSlots.filter(
    (s) => s.status === "complete" && s.post?.image_url
  ).length;

  const showContent =
    Boolean(site) &&
    (firstPostReady ||
      phase === "complete" ||
      phase === "publishing" ||
      (phase === "error" && postSlots.some((s) => s.status === "complete")));

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Step 3</p>
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-[#C5C6C7] tracking-tight">
          Launch Your Website
        </h1>
        <p className="text-[#9fb0b5] text-base sm:text-lg max-w-2xl leading-relaxed">
          Press one button and we build your website for you — helpful articles, pictures, and your
          product links included. Then it goes live on the internet. Everything is saved to your
          account.
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

      {bootstrapping && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#45A29E]/20 bg-black/40 p-4 sm:p-5 flex flex-col gap-3"
        >
          <AiLoadingBar
            label={DEPLOY_LOADING_STEPS[loadingStep]}
            progress={progress}
            active
            className="w-full"
          />
          <p className="text-[11px] text-[#6b7280] leading-relaxed">
            Building your money site — your first article and hero image will appear here as soon
            as they&apos;re ready. The rest keep generating in the background.
          </p>
        </motion.div>
      )}

      {phase === "setup" && (
        <GenerationTerminal phase={terminalPhase} progress={progress} logLines={generationLog} />
      )}

      {showContent && site && (
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
                  : postsWithImages < postSlots.length
                    ? `Generating content — ${postsWithImages}/${postSlots.length} posts with images`
                    : `Finalizing — ${completedPosts}/${postSlots.length} posts ready`
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

      {phase === "idle" && canResume && site && postSlots.length > 0 && !showContent && (
        <DeployPostGrid slots={postSlots} onViewPost={setPreviewPostId} />
      )}

      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <CheckCircle2 className="text-[#45A29E]" size={28} />
          <p className="text-base text-[#C5C6C7]">Your website is live and ready for visitors.</p>
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
            Turn On My Website
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
