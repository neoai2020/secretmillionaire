"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Play,
  BookOpen,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Route,
} from "lucide-react";
import Link from "next/link";
import { trainingContent } from "@/config/training.config";
import { trainingContentData } from "@/config/training-content";
import { TrainingFaqItem } from "../components/TrainingFaqItem";
import { TrainingStepCard } from "../components/TrainingStepCard";
import { TrainingIcon } from "../lib/training-icons";

const VIDEOS = trainingContent.videos.filter((v) => v.id);
const {
  intro,
  paths,
  extractionSteps,
  empireBuilderSteps,
  premiumTools,
  proTips,
  quickStartChecklist,
  faqSections,
  cta,
  videoPlaceholder,
} = trainingContentData;

export default function TrainingPage() {
  const faqCount = faqSections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-12 max-w-5xl mx-auto w-full py-6"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center rounded-lg">
            <GraduationCap size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="brand-font text-2xl text-text-heading tracking-tight">
              {trainingContent.pageTitle}
            </h1>
            <p className="text-sm text-text-muted">{trainingContent.pageSubtitle}</p>
          </div>
        </div>
      </header>

      <section className="glass-card p-6 flex flex-col gap-2">
        <h2 className="text-lg font-bold text-text-heading">{intro.headline}</h2>
        <p className="text-[13px] text-text-secondary leading-relaxed">{intro.body}</p>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Play size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-text-heading">Video Training</h2>
        </div>

        {VIDEOS.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VIDEOS.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden"
              >
                <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://player.vimeo.com/video/${video.id}?badge=0&autopause=0&player_id=0&app_id=58479`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    allowFullScreen
                    title={video.title}
                  />
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded self-start">
                    Video {i + 1}
                  </span>
                  <h3 className="text-sm font-bold text-text-heading">{video.title}</h3>
                  <p className="text-[12px] text-text-muted leading-relaxed">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-text-muted">{videoPlaceholder}</p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Route size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-text-heading">Two Paths to Income</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paths.map((path, i) => (
            <motion.div
              key={path.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5 flex flex-col gap-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center shrink-0">
                  <TrainingIcon id={path.icon} size={16} className="text-accent" />
                </div>
                <h3 className="text-sm font-bold text-text-heading">{path.title}</h3>
              </div>
              <p className="text-[12px] text-text-muted leading-relaxed">{path.subtitle}</p>
              <ul className="flex flex-col gap-2">
                {path.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-[12px] text-text-secondary">
                    <CheckCircle2 size={12} className="text-green-400 shrink-0 mt-0.5" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                href={path.ctaHref}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent mt-auto hover:underline"
              >
                {path.ctaLabel}
                <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-text-heading">Activation</h2>
        </div>
        <p className="text-sm text-text-muted -mt-2">
          Run this once from your dashboard — one button covers all three phases and unlocks your deploy tools.
        </p>
        <div className="flex flex-col gap-4">
          {extractionSteps.map((step, i) => (
            <TrainingStepCard key={step.step} step={step} index={i} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-text-heading">Build Your Website — Step by Step</h2>
        </div>
        <p className="text-sm text-text-muted -mt-2">
          Your own website: 1 main guide + 6 helpful articles, put online with your product links.
        </p>
        <div className="flex flex-col gap-4">
          {empireBuilderSteps.map((step, i) => (
            <TrainingStepCard key={step.step} step={step} index={i} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#D4AF37]" />
          <h2 className="text-lg font-bold text-text-heading">Society Access — Premium Tools</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {premiumTools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5 flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg flex items-center justify-center shrink-0">
                  <TrainingIcon id={tool.icon} size={16} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-sm font-bold text-text-heading">{tool.title}</h3>
              </div>
              <p className="text-[12px] text-text-muted leading-relaxed">{tool.text}</p>
              <Link
                href={tool.href}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] hover:underline"
              >
                Open tool
                <ArrowRight size={11} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-text-heading">Pro Tips for More Earnings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proTips.map((tip) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <TrainingIcon id={tip.icon} size={15} className="text-accent" />
                </div>
                <h3 className="text-[13px] font-bold text-text-heading">{tip.title}</h3>
              </div>
              <p className="text-[12px] text-text-muted leading-relaxed">{tip.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-400" />
          <h2 className="text-lg font-bold text-text-heading">Quick Start Checklist</h2>
        </div>

        <div className="border border-green-500/15 rounded-xl bg-green-500/3 p-5 flex flex-col gap-3">
          {quickStartChecklist.map((item, i) => (
            <div key={item} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md border border-green-500/20 bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-black text-green-400">{i + 1}</span>
              </div>
              <span className="text-[13px] text-text-secondary leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-text-heading">Frequently Asked Questions</h2>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-2">
            {faqCount} answers
          </span>
        </div>

        <div className="flex flex-col gap-6">
          {faqSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <h3 className="text-[11px] font-bold text-accent uppercase tracking-[0.15em] px-1 mb-1">
                {section.title}
              </h3>
              {section.items.map((item) => (
                <TrainingFaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="border border-accent/20 rounded-xl bg-accent/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-text-heading">{cta.title}</h3>
          <p className="text-[13px] text-text-muted">{cta.subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link href={cta.primaryHref} className="btn-primary h-11 px-6 text-sm rounded-lg flex items-center gap-2">
            <TrainingIcon id="mapPin" size={16} />
            <span>{cta.primaryLabel}</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href={cta.secondaryHref}
            className="h-11 px-6 text-sm rounded-lg flex items-center gap-2 border border-accent/30 text-accent hover:bg-accent/5 transition-colors"
          >
            <TrainingIcon id="repeat" size={16} />
            <span>{cta.secondaryLabel}</span>
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
