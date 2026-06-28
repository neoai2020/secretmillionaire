"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { PARTNER_LINK_PLACEHOLDER } from "@/config/offers.config";

const CTA_URL = PARTNER_LINK_PLACEHOLDER;

export default function ScaleTrainingPage() {
    return (
        <div className="flex flex-col gap-10 pb-10">
            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center gap-6"
            >
                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-5 py-2">
                    <Sparkles size={14} className="text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-[0.15em]">Exclusive Training</span>
                </div>

                <h1 className="brand-font text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
                    Scale Your{" "}
                    <span className="text-accent">CashTap AI</span>
                    {" "}To $1,000+ Per Day
                </h1>

                <p className="text-text-secondary text-base md:text-lg max-w-xl">
                    Watch this exclusive training to multiply your results and automate your path to life-changing income.
                </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
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
