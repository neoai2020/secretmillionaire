"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, Rocket, Palette, Lightbulb, FileText, Crown } from "lucide-react";
import { ACCELERATOR_TEMPLATES } from "../data/templates";
import { buildClusterTopics } from "@/features/blog-builder/lib/templates";

const NICHE_COLORS: Record<string, string> = {
  "Health & Fitness": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Personal Finance": "text-accent bg-[#45A29E]/10 border-[#45A29E]/20",
  "Online Business": "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20",
  "Weight Loss": "text-rose-400 bg-rose-400/10 border-rose-400/20",
  "Self-Improvement": "text-purple-400 bg-purple-400/10 border-purple-400/20",
};
const DEFAULT_NC = "text-text-muted bg-white/5 border-white/10";

export default function AcceleratorPreviewPage({ id }: { id: number }) {
  const template = ACCELERATOR_TEMPLATES.find((t) => t.id === id);

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4 max-w-3xl mx-auto w-full">
        <p className="text-text-muted text-sm">This blueprint could not be found.</p>
        <Link href="/accelerator" className="btn-primary h-10 px-5 text-sm rounded-lg">
          <ArrowLeft size={15} /> Back to Accelerator
        </Link>
      </div>
    );
  }

  const nc = NICHE_COLORS[template.niche] || DEFAULT_NC;
  const outline = buildClusterTopics(template.name, template.niche);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 sm:gap-8 pb-16 max-w-3xl mx-auto w-full"
    >
      <Link
        href="/accelerator"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors self-start"
      >
        <ArrowLeft size={14} /> Back to Accelerator
      </Link>

      {/* Blueprint hero */}
      <div className="glass-card p-6 sm:p-8 lg:p-10 border border-[#D4AF37]/15">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
            <Crown className="w-3 h-3" /> Blueprint Preview
          </span>
          <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", nc)}>
            {template.niche}
          </span>
        </div>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-heading tracking-tight mb-3">{template.name}</h1>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-accent shrink-0" />
          <span className="text-sm text-text-secondary font-medium">{template.angle}</span>
        </div>
        <p className="text-text-muted text-sm sm:text-base leading-relaxed">{template.description}</p>
      </div>

      {/* What gets built */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-accent" />
          <h2 className="brand-font text-lg text-text-heading">What your money site includes</h2>
        </div>
        <p className="text-xs text-text-muted mb-5">
          Deploying this blueprint generates a full interlinked site — a pillar guide plus six cluster
          articles, each with images, SEO, and your affiliate link woven in.
        </p>
        <ul className="flex flex-col gap-2.5">
          {outline.map((topic, i) => (
            <li key={topic.slug} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className={clsx(
                "w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0",
                topic.isPillar ? "bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]" : "bg-accent/10 border border-accent/20 text-accent"
              )}>
                {i + 1}
              </span>
              <span className="text-sm text-text-secondary flex-1">{topic.title}</span>
              {topic.isPillar && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] shrink-0">Pillar</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended offers */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="brand-font text-lg text-text-heading">Recommended offers</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {template.recommendedProducts.map((p, i) => (
            <span key={i} className="inline-flex items-center px-3 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-text-secondary">{p}</span>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/accelerator" className="btn-primary flex-1 py-3.5">
          <Rocket size={16} /> Arm This Blueprint
        </Link>
        <Link
          href="/territory"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-text-secondary uppercase tracking-wider hover:bg-white/10 hover:text-text-heading transition-all"
        >
          Deploy a Money Site <ArrowRight size={15} />
        </Link>
      </div>
    </motion.div>
  );
}
