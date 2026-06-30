"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Crown,
  Infinity as InfinityIcon,
  Rocket,
  Facebook,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Globe,
  ArrowRight,
  Sparkles,
  Search,
  BookOpen,
  Clock,
  MessageCircle,
} from "lucide-react";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";

const FB_LOADING_STEPS = [
  "AI is scanning trending angles in your niche…",
  "Finding the highest-click hooks for Facebook…",
  "Analyzing buyer-intent triggers…",
  "Testing curiosity angles that stop the scroll…",
  "Mapping posts to your site articles…",
  "Crafting personal-story openers…",
  "Writing helpful-tip variations…",
  "Polishing copy for group engagement…",
  "Running a final engagement pass…",
  "Almost done — packaging your 10 posts…",
];

const POSTING_GUIDE = [
  {
    icon: Search,
    title: "Find the right groups",
    points: [
      "In the Facebook search bar, type buyer-intent keywords for your niche — e.g. \"<niche> tips\", \"<niche> for beginners\", \"<niche> deals\", or \"<niche> support\".",
      "Click the Groups tab to filter results to groups only.",
      "Join 10–15 active groups with 5,000+ members that have fresh posts every day — bigger, busier groups = more eyeballs.",
    ],
  },
  {
    icon: BookOpen,
    title: "Check the group rules first",
    points: [
      "Open the group's About / rules section before posting. Many groups ban links or self-promo.",
      "If links aren't allowed: post the story without the link, then drop your link in a comment or DM people who engage.",
      "Respect 'promo day only' rules and admin approval — getting banned kills the group as a traffic source.",
    ],
  },
  {
    icon: Clock,
    title: "Post naturally & consistently",
    points: [
      "Aim for 3–5 posts per day spread across different groups — never spam the same group repeatedly.",
      "Rotate which post you use so your content doesn't look copy-pasted.",
      "Best engagement windows: 7–9am, 12–1pm, and 7–9pm in your audience's time zone.",
    ],
  },
  {
    icon: MessageCircle,
    title: "Engage, don't just drop links",
    points: [
      "Reply to comments and be genuinely helpful — a little trust massively boosts clicks.",
      "Answer questions in the group even when you're not posting; people check your profile.",
      "Consistency wins: a few posts every day beats a big burst once a week.",
    ],
  },
];

interface SiteOption {
  id: string;
  title: string;
  slug: string;
  postCount: number;
  livePostCount: number;
}

interface QuotaState {
  usedToday: number;
  unlimited?: boolean;
}

export default function AcceleratorPage() {
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  const [posts, setPosts] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");

  const messageTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!generating) {
      if (messageTimer.current) clearInterval(messageTimer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
      return;
    }

    setLoadingStep(0);
    setLoadingProgress(0);

    messageTimer.current = setInterval(() => {
      setLoadingStep((step) => (step + 1) % FB_LOADING_STEPS.length);
    }, 2800);

    progressTimer.current = setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 92) return current;
        const bump = current < 35 ? 2.8 : current < 65 ? 1.4 : 0.5;
        return Math.min(92, current + bump);
      });
    }, 450);

    return () => {
      if (messageTimer.current) clearInterval(messageTimer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [generating]);

  useEffect(() => {
    setOrigin(window.location.origin);

    fetch("/api/blog/quota", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.quota && setQuota(d.quota as QuotaState))
      .catch(() => {});

    fetch("/api/blog/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const summaries = Array.isArray(d.summaries) ? d.summaries : [];
        const opts: SiteOption[] = summaries
          .map((s: { site: { id: string; title: string; slug: string }; postCount: number; livePostCount: number }) => ({
            id: s.site.id,
            title: s.site.title,
            slug: s.site.slug,
            postCount: s.postCount,
            livePostCount: s.livePostCount,
          }))
          .filter((s: SiteOption) => s.postCount > 0);
        setSites(opts);
        if (opts.length > 0) setSelectedSiteId(opts[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingSites(false));
  }, []);

  const selectedSite = useMemo(
    () => sites.find((s) => s.id === selectedSiteId) ?? null,
    [sites, selectedSiteId]
  );

  const resolve = (text: string) =>
    selectedSite ? text.split("[LINK]").join(`${origin}/sites/${selectedSite.slug}`) : text;

  const handleGenerate = async () => {
    if (!selectedSiteId) return;
    setGenerating(true);
    setError(null);
    setPosts([]);
    try {
      const res = await fetch("/api/blog/facebook-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: selectedSiteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setLoadingProgress(100);
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(resolve(text));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-5xl mx-auto w-full">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 lg:p-12 text-center border border-[#D4AF37]/15">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
          <Crown className="w-3.5 h-3.5" /> Society Upgrade
        </div>
        <h1 className="brand-font text-3xl md:text-4xl text-text-heading tracking-tight mb-3">Accelerator</h1>
        <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Your unlocked perks: build unlimited money sites, and spin up ready-to-post Facebook
          content for any site you&apos;ve generated.
        </p>
      </motion.div>

      {/* Unlimited pass */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#45A29E]/30 p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(69,162,158,0.16) 0%, rgba(11,12,16,0.55) 46%, rgba(212,175,55,0.13) 100%)",
          boxShadow: "0 0 48px rgba(69,162,158,0.14)",
        }}
      >
        {/* shimmer accent + glow orbs */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, #D4AF37, #45A29E, #D4AF37)" }}
          aria-hidden
        />
        <motion.div
          aria-hidden
          className="absolute -top-12 -left-10 w-52 h-52 rounded-full blur-[80px] bg-[#45A29E]/30 pointer-events-none"
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.12, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-16 right-0 w-56 h-56 rounded-full blur-[90px] bg-[#D4AF37]/16 pointer-events-none"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <motion.div
            className="shrink-0 w-16 h-16 rounded-2xl bg-[#45A29E]/15 border border-[#45A29E]/30 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 0px rgba(69,162,158,0)",
                "0 0 30px rgba(69,162,158,0.55)",
                "0 0 0px rgba(69,162,158,0)",
              ],
            }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <InfinityIcon className="w-8 h-8 text-accent" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">
                No Limits Unlocked
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/25 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  style={{ boxShadow: "0 0 6px rgba(74,222,128,0.9)" }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
                Active
              </span>
            </div>

            <h2 className="brand-font text-2xl sm:text-3xl text-text-heading tracking-tight leading-tight">
              Build Money Sites{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #D4AF37, #f1dc94, #D4AF37)" }}
              >
                Without Limits
              </span>
            </h2>

            <p className="text-sm text-text-secondary mt-2 max-w-xl leading-relaxed">
              The 5-a-day cap is gone for good. Chase every niche, test every angle, and deploy a new
              cash asset the moment inspiration strikes — no quota, no waiting, no ceiling.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: InfinityIcon, label: "Daily cap removed" },
                { icon: Sparkles, label: quota ? `${quota.usedToday} built today` : "Deploy on demand" },
                { icon: Rocket, label: "1-click deploy" },
              ].map((chip) => {
                const ChipIcon = chip.icon;
                return (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-text-secondary"
                  >
                    <ChipIcon className="w-3.5 h-3.5 text-accent" />
                    {chip.label}
                  </span>
                );
              })}
            </div>
          </div>

          <Link
            href="/territory"
            className="group relative inline-flex items-center justify-center gap-2 w-full lg:w-auto shrink-0 px-7 py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-[#0B0C10]"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #45A29E 100%)",
              boxShadow: "0 0 32px rgba(212,175,55,0.3)",
            }}
          >
            <Rocket className="w-4 h-4" />
            Build a Site
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>

      {/* Facebook post generator */}
      <div className="glass-card p-5 sm:p-7 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Facebook size={18} className="text-accent" />
          <h2 className="brand-font text-lg text-text-heading">Generate Facebook Posts For Your Sites</h2>
        </div>
        <p className="text-sm text-text-muted -mt-2">
          Pick a money site you&apos;ve generated and we&apos;ll write 10 ready-to-post Facebook
          posts that drive traffic to it. Copy, paste into a group, done.
        </p>

        {loadingSites ? (
          <div className="flex items-center gap-3 text-text-muted text-sm py-6">
            <Loader2 className="animate-spin text-accent" size={18} /> Loading your sites…
          </div>
        ) : sites.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center flex flex-col items-center gap-3">
            <Globe className="text-text-muted/60" size={28} />
            <p className="text-sm text-text-muted">You haven&apos;t generated any money sites yet.</p>
            <Link href="/territory" className="btn-primary h-10 px-5 text-xs rounded-lg uppercase tracking-wider">
              <Rocket size={14} /> Build your first site <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            {/* Site selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Your generated sites</label>
              <div className="flex flex-wrap gap-2">
                {sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => { setSelectedSiteId(site.id); setPosts([]); setError(null); }}
                    className={clsx(
                      "px-4 py-2.5 rounded-xl border text-xs font-bold transition-all text-left max-w-full",
                      selectedSiteId === site.id
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "bg-white/[0.02] border-white/10 text-text-muted hover:bg-white/5 hover:text-text-secondary"
                    )}
                  >
                    <span className="block truncate max-w-[16rem]">{site.title}</span>
                    <span className="block text-[10px] font-normal opacity-70">{site.postCount} articles</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !selectedSiteId}
              className="btn-primary py-3.5 self-start px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <><Loader2 className="animate-spin" size={16} /> Generating…</>
              ) : posts.length > 0 ? (
                <><RefreshCw size={16} /> Regenerate 10 Posts</>
              ) : (
                <><Sparkles size={16} /> Generate 10 Facebook Posts</>
              )}
            </button>

            <AnimatePresence>
              {generating && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-xl border border-accent/20 bg-accent/[0.06] p-4 sm:p-5 flex flex-col gap-3"
                >
                  <AiLoadingBar
                    label={FB_LOADING_STEPS[loadingStep]}
                    progress={loadingProgress}
                    active
                    className="w-full"
                  />
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Writing 10 unique posts for{" "}
                    <span className="text-text-secondary font-semibold">{selectedSite?.title}</span>.
                    This usually takes 15–30 seconds.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-sm text-red-400/90">{error}</p>}

            {posts.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                  {posts.length} posts ready · link points to {selectedSite?.title}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {posts.map((post, idx) => {
                    const isCopied = copiedIdx === idx;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="rounded-xl bg-black/30 border border-white/5 p-4 flex flex-col gap-3"
                      >
                        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap flex-1">
                          {resolve(post)}
                        </p>
                        <button
                          onClick={() => handleCopy(idx, post)}
                          className={clsx(
                            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all self-start",
                            isCopied ? "bg-green-500 text-black" : "btn-primary"
                          )}
                        >
                          {isCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Post</>}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* How & where to post */}
      <div className="glass-card p-5 sm:p-7 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Facebook size={18} className="text-accent" />
          <h2 className="brand-font text-lg text-text-heading">Where &amp; How to Post on Facebook</h2>
        </div>
        <p className="text-sm text-text-muted -mt-2">
          Generated posts only earn when real people see them. Use this playbook to find the right
          groups and post without getting flagged.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {POSTING_GUIDE.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-xl bg-white/[0.02] border border-white/5 p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-accent" />
                  </div>
                  <h3 className="text-sm font-bold text-text-heading">{section.title}</h3>
                </div>
                <ul className="flex flex-col gap-2">
                  {section.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-text-secondary leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            <span className="font-bold text-[#D4AF37]">Pro tip:</span> generate a fresh batch above for
            each money site, then work through 3–5 groups a day. The more quality posts you have
            circulating, the more traffic flows back to your sites.
          </p>
        </div>
      </div>
    </div>
  );
}
