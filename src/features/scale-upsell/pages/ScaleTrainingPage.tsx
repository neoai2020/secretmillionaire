"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { PARTNER_LINK_PLACEHOLDER } from "@/config/offers.config";

const CTA_URL = PARTNER_LINK_PLACEHOLDER;

export default function ScaleTrainingPage() {
  return (
    <div className="page-stack w-full page-container-narrow items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center text-center gap-6 w-full"
      >
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-5 py-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-xs font-bold text-accent uppercase tracking-[0.15em]">
            Exclusive Training
          </span>
        </div>

        <h1 className="ds-h1 max-w-3xl">
          Scale Your <span className="text-accent">Society Income</span> To $1,000+ Per Day
        </h1>

        <p className="ds-subtitle max-w-xl">
          Watch this exclusive training to multiply your results and automate your path to
          life-changing income.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center w-full"
      >
        <a
          href={CTA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-3 bg-accent hover:bg-yellow-500 text-black font-bold text-lg px-10 py-5 rounded-xl transition-all shadow-gold hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]"
        >
          <span className="brand-font tracking-wide">Click Here To Access Training</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </div>
  );
}
