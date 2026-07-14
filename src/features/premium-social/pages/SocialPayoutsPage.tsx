"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  Zap,
  Filter,
  Eye,
  Copy,
  Check,
  Facebook,
  TrendingUp,
  Sparkles,
  DollarSign,
  ExternalLink,
  Users,
} from "lucide-react";
import { AffiliateLinkPicker } from "@/components/AffiliateLinkPicker";
import { isValidAffiliateUrl } from "@/features/blog-builder/lib/affiliate-url";
import { SOCIAL_NICHES, SOCIAL_POSTS } from "../data/posts";

const STEPS = [
  { n: 1, title: "Pick Your Niche", text: "Choose from 8 proven niches that people spend money in every day." },
  { n: 2, title: "Pick Your Link", text: "Choose a saved product link from your vault or add a new one — every post uses it automatically." },
  { n: 3, title: "Copy & Paste Posts", text: "One-click copy into any Facebook group and start earning commissions." },
];

export default function SocialPayoutsPage() {
  const [activeNiche, setActiveNiche] = useState<string>("All");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [showPosts, setShowPosts] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (activeNiche === "All" ? SOCIAL_POSTS : SOCIAL_POSTS.filter((p) => p.niche === activeNiche)),
    [activeNiche]
  );

  useEffect(() => {
    if (showPosts && !isValidAffiliateUrl(affiliateLink)) setShowPosts(false);
  }, [affiliateLink, showPosts]);

  const resolve = (text: string) =>
    affiliateLink.trim() ? text.split("[LINK]").join(affiliateLink.trim()) : text;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(resolve(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShow = () => {
    if (!isValidAffiliateUrl(affiliateLink)) return;
    setShowPosts(true);
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-5xl mx-auto w-full">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 lg:p-12 text-center border border-[#D4AF37]/15">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/20">
          <Zap className="text-[#D4AF37]" size={30} />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Society Access
        </div>
        <h1 className="brand-font text-3xl md:text-4xl text-text-heading tracking-tight mb-3">Social Payouts</h1>
        <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {SOCIAL_POSTS.length}+ ready-to-post Facebook messages across{" "}
          <span className="text-text-primary font-semibold">8 profitable niches</span>. Paste your
          affiliate link, copy a post, and drop it into any Facebook group.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-2">
          <Users className="text-green-400" size={16} />
          <span className="text-xs font-semibold text-green-400">Copy · paste · earn — no writing required</span>
        </div>
      </motion.div>

      {/* 3 steps */}
      <div className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="glass-tile text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-black text-lg font-bold">{s.n}</div>
            <h3 className="mt-3 text-sm font-bold text-text-heading">{s.title}</h3>
            <p className="mt-1.5 text-xs text-text-muted leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>

      {/* DigiStore recommendation */}
      <div className="glass-card p-5 sm:p-6 border border-green-500/15 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/15">
          <DollarSign className="text-green-400" size={24} />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-heading">Need an affiliate link? Start here (free)</h3>
          <p className="mt-1 text-sm text-text-muted leading-relaxed">
            We recommend <span className="font-semibold text-green-400">DigiStore24</span> — a free marketplace with
            thousands of digital products in every niche. Sign up takes 2 minutes, no approval needed.
          </p>
          <a href="https://www.digistore24.com" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-500/15 px-4 py-2 text-xs font-bold text-green-400 hover:bg-green-500/25 transition">
            Go to DigiStore24 <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Niche filter */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-accent" size={18} />
          <h3 className="brand-font text-lg text-text-heading">Choose Your Niche</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_NICHES.map((niche) => {
            const count = niche === "All" ? SOCIAL_POSTS.length : SOCIAL_POSTS.filter((p) => p.niche === niche).length;
            return (
              <button
                key={niche}
                onClick={() => setActiveNiche(niche)}
                className={clsx(
                  "rounded-xl px-4 py-2.5 text-xs font-bold transition",
                  activeNiche === niche ? "bg-accent text-black" : "border border-white/10 bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-secondary"
                )}
              >
                {niche} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Affiliate link picker */}
      <div className="glass-card p-5 sm:p-6">
        <h3 className="brand-font text-lg text-text-heading mb-2">Your Affiliate Link</h3>
        <p className="mb-4 text-sm text-text-muted">
          Select from your Link Vault or add a new DigiStore URL. The{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-accent">[LINK]</code> tag in each post
          is swapped for your link automatically.
        </p>

        <AffiliateLinkPicker value={affiliateLink} onChange={setAffiliateLink} />

        <button
          onClick={handleShow}
          disabled={!isValidAffiliateUrl(affiliateLink)}
          className="btn-primary px-6 py-3.5 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye size={18} /> Show My Posts
        </button>
      </div>

      {/* Posts */}
      {showPosts && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="brand-font text-lg text-text-heading flex items-center gap-2">
              <Sparkles className="text-[#D4AF37]" size={18} /> Your Posts — Ready to Copy
            </h3>
            <span className="text-xs text-text-muted">{filtered.length} post{filtered.length !== 1 && "s"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p, idx) => {
              const isCopied = copiedId === p.id;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="glass-card p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold uppercase tracking-wider text-accent">{p.niche}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400">
                      <TrendingUp size={12} /> ${p.earningsMin}–${p.earningsMax}<span className="text-text-muted font-normal"> /mo</span>
                    </span>
                  </div>
                  <div className="rounded-lg bg-black/30 border border-white/5 p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] text-text-muted/70">
                      <Facebook size={12} /> Facebook post preview
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{resolve(p.post)}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(p.id, p.post)}
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
    </div>
  );
}
