"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Eye, FileText, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";
import type { BlogPost, PostSlotState } from "../types";

export type { PostSlotStatus } from "../types";
export type { PostSlotState };

interface DeployPostSlotProps {
  slot: PostSlotState;
  index: number;
  isPillar?: boolean;
  onViewPost?: (postId: string) => void;
}

function ShimmerBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-[#1e2128] animate-pulse ${className}`} />;
}

function PostHeroImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-[#1e2128] to-[#0d1016] flex items-center justify-center">
        <ImageIcon className="text-[#45A29E]/40" size={40} />
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1e2128]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function DeployPostSlot({ slot, index, isPillar, onViewPost }: DeployPostSlotProps) {
  const { topic, status, progress, post } = slot;
  const imagePending = Boolean(post && !post.image_url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border overflow-hidden flex flex-col ${
        status === "complete"
          ? "border-[#45A29E]/40 bg-[#12141a]"
          : status === "generating"
            ? "border-[#45A29E]/50 bg-[#0d1016] shadow-[0_0_24px_rgba(69,162,158,0.12)]"
            : status === "error"
              ? "border-red-500/40 bg-[#12141a]"
              : "border-[#1e2128] bg-[#0a0b0e]"
      } ${isPillar ? "sm:col-span-2" : ""}`}
    >
      <AnimatePresence mode="wait">
        {status === "complete" && post ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full"
          >
            {post.image_url ? (
              <div className="relative">
                <PostHeroImage src={post.image_url} alt={post.image_alt ?? post.title} />
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#45A29E]/90 px-2 py-0.5 text-[10px] font-bold uppercase text-[#0B0C10]">
                  <CheckCircle2 size={12} />
                  Ready
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1e2128] flex flex-col items-center justify-center gap-2">
                <Loader2 size={22} className="text-[#45A29E] animate-spin" />
                <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Generating image...</p>
              </div>
            )}
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {(post.is_pillar || isPillar) && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      Pillar
                    </span>
                  )}
                  <h3 className="brand-font text-[#C5C6C7] text-sm sm:text-base leading-snug">
                    {post.title}
                  </h3>
                </div>
              </div>
              {post.excerpt && (
                <p className="text-xs text-[#6b7280] line-clamp-2 leading-relaxed">{post.excerpt}</p>
              )}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                <AiLoadingBar
                  label={imagePending ? "Text ready — image loading" : "Generated"}
                  progress={imagePending ? Math.max(progress, 85) : 100}
                />
                {onViewPost && (
                  <button
                    type="button"
                    onClick={() => onViewPost(post.id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold text-[#0B0C10] bg-[#45A29E] hover:opacity-90 transition-opacity"
                  >
                    <Eye size={14} />
                    View article
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 flex flex-col gap-3 h-full min-h-[180px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {isPillar && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/70">
                    Pillar
                  </span>
                )}
                <p className="text-sm text-[#C5C6C7]/90 font-medium truncate">{topic.title}</p>
              </div>
              {status === "generating" ? (
                <Loader2 size={16} className="text-[#45A29E] animate-spin shrink-0" />
              ) : status === "queued" ? (
                <FileText size={16} className="text-[#6b7280]/50 shrink-0" />
              ) : (
                <Sparkles size={16} className="text-[#D4AF37] shrink-0" />
              )}
            </div>

            <ShimmerBlock className="h-24 w-full rounded-lg" />

            <div className="space-y-2 flex-1">
              <ShimmerBlock className="h-2.5 w-full" />
              <ShimmerBlock className="h-2.5 w-[80%]" />
            </div>

            {status === "generating" && (
              <AiLoadingBar label="AI writing article" progress={progress} className="mt-auto" />
            )}
            {status === "queued" && (
              <p className="text-[10px] uppercase tracking-wider text-[#6b7280]/70 mt-auto">
                Queued — waiting to generate
              </p>
            )}
            {status === "error" && (
              <p className="text-xs text-red-400/90 mt-auto">{slot.error ?? "Generation failed"}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface DeployPostGridProps {
  slots: PostSlotState[];
  onViewPost?: (postId: string) => void;
}

export function DeployPostGrid({ slots, onViewPost }: DeployPostGridProps) {
  const pillar = slots.find((s) => s.topic.isPillar);
  const clusters = slots.filter((s) => !s.topic.isPillar);
  const completed = slots.filter((s) => s.status === "complete").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#45A29E]">
          Content pipeline
        </p>
        <p className="text-xs text-[#6b7280] tabular-nums">
          {completed}/{slots.length} posts ready
        </p>
      </div>

      {pillar && <DeployPostSlot slot={pillar} index={0} isPillar onViewPost={onViewPost} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {clusters.map((slot, i) => (
          <DeployPostSlot key={slot.topic.slug} slot={slot} index={i + 1} onViewPost={onViewPost} />
        ))}
      </div>
    </div>
  );
}
