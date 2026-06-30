"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { TrainingStep } from "@/config/training-content";
import { TrainingIcon } from "../lib/training-icons";

export function TrainingStepCard({
  step,
  index,
  showStepLabel = true,
}: {
  step: TrainingStep;
  index: number;
  showStepLabel?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-5 flex flex-col gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center shrink-0">
          <TrainingIcon id={step.icon} size={18} className="text-accent" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          {showStepLabel && (
            <span className="text-[9px] font-bold text-accent uppercase tracking-widest">
              Step {step.step}
            </span>
          )}
          <h3 className="text-base font-bold text-text-heading">{step.title}</h3>
          <p className="text-[13px] text-text-secondary leading-relaxed">{step.description}</p>
          {step.href && (
            <Link
              href={step.href}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent mt-1 hover:underline"
            >
              Open in app
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>

      <div className="pl-14 flex flex-col gap-3">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tips</p>
        <div className="flex flex-col gap-2">
          {step.tips.map((tip) => (
            <div key={tip} className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-green-400 shrink-0 mt-0.5" />
              <span className="text-[12px] text-text-secondary leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>

        {step.examples && step.examples.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-full">
              Try:
            </span>
            {step.examples.map((ex) => (
              <span
                key={ex}
                className="text-[11px] px-2.5 py-1 bg-accent/5 border border-accent/15 rounded-md text-accent font-medium"
              >
                {ex}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
