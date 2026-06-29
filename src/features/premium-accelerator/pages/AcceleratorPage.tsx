"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");

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
      <div className="glass-card p-5 sm:p-6 border border-[#45A29E]/25 flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-[#45A29E]/15 border border-[#45A29E]/20 flex items-center justify-center">
          <InfinityIcon className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="brand-font text-lg text-text-heading">Unlimited Empire Builder</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/20 text-[10px] font-bold text-green-400 uppercase">
              <Check className="w-3 h-3" /> Active
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            The daily money-site cap is lifted. Generate as many sites as you want
            {quota ? ` · ${quota.usedToday} generated today.` : "."}
          </p>
        </div>
        <Link href="/territory" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-xs uppercase tracking-wider shrink-0">
          <Rocket className="w-3.5 h-3.5" /> Build a Site
        </Link>
      </div>

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
                <><Loader2 className="animate-spin" size={16} /> Writing 10 posts…</>
              ) : posts.length > 0 ? (
                <><RefreshCw size={16} /> Regenerate 10 Posts</>
              ) : (
                <><Sparkles size={16} /> Generate 10 Facebook Posts</>
              )}
            </button>

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
