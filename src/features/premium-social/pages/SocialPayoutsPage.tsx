"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  Megaphone,
  Copy,
  Check,
  Link2,
  Sparkles,
  Heart,
  DollarSign,
  Dumbbell,
  Users,
  Brain,
} from "lucide-react";
import { SOCIAL_NICHES, SOCIAL_POSTS } from "../data/posts";

const NICHE_ICONS: Record<string, React.ElementType> = {
  "Weight Loss": Heart,
  "Make Money Online": DollarSign,
  "Health & Fitness": Dumbbell,
  "Relationships": Users,
  "Self-Improvement": Brain,
};

const LINK_PLACEHOLDER = "{LINK}";

export default function SocialPayoutsPage() {
  const [affiliateLink, setAffiliateLink] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string>(SOCIAL_NICHES[0]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const posts = useMemo(
    () => SOCIAL_POSTS.filter((p) => p.niche === selectedNiche),
    [selectedNiche]
  );

  const resolve = (text: string) =>
    affiliateLink.trim()
      ? text.split(LINK_PLACEHOLDER).join(affiliateLink.trim())
      : text;

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(resolve(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-5xl mx-auto w-full">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 lg:p-12 text-center border border-[#D4AF37]/15">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
          <Sparkles className="w-3.5 h-3.5" /> Society Access
        </div>
        <h1 className="brand-font text-3xl md:text-4xl text-text-heading tracking-tight mb-3">Social Payouts</h1>
        <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Ready-to-post social content written as personal stories — proven to spark engagement in groups
          and feeds. Drop in your affiliate link once and every post is armed instantly.
        </p>
      </motion.div>

      {/* Affiliate link input */}
      <div className="glass-card p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-accent" />
          <span className="text-sm font-bold text-text-primary">Your affiliate link</span>
        </div>
        <input
          type="text"
          value={affiliateLink}
          onChange={(e) => setAffiliateLink(e.target.value)}
          placeholder="https://www.digistore24.com/redir/..."
          className="input-base w-full"
        />
        <p className="text-xs text-text-muted">
          {affiliateLink.trim()
            ? "Your link is now inserted into every post below — just copy and paste."
            : "Add your link to auto-insert it into every post. You can still copy posts without it."}
        </p>
      </div>

      {/* Niche tabs */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-3">Pick a niche</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {SOCIAL_NICHES.map((niche) => {
            const Icon = NICHE_ICONS[niche] ?? Megaphone;
            const isActive = selectedNiche === niche;
            return (
              <button
                key={niche}
                onClick={() => setSelectedNiche(niche)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border transition-all text-center",
                  isActive ? "bg-accent/10 border-accent/30 text-accent" : "bg-white/[0.02] border-white/5 text-text-muted hover:bg-white/5 hover:text-text-secondary"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wide leading-tight">{niche}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post, index) => {
          const isCopied = copiedId === post.id;
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="glass-card p-5 flex flex-col gap-4"
            >
              <p className="text-sm text-text-secondary leading-relaxed flex-1 whitespace-pre-wrap">
                {resolve(post.text)}
              </p>
              <button
                onClick={() => handleCopy(post.id, post.text)}
                className={clsx(
                  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all self-start",
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
  );
}
