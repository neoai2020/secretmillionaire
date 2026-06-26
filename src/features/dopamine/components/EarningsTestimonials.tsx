"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, DollarSign, BadgeCheck, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
    {
        name: "Sarah M.",
        location: "Florida",
        earning: "$2,340/mo",
        niche: "weight loss",
        text: "I had zero tech experience. I just followed the 4 steps and started getting commissions in my first week. This changed my life.",
        avatar: "SM",
        color: "bg-pink-500",
        daysUsing: 47,
    },
    {
        name: "James R.",
        location: "Texas",
        earning: "$1,870/mo",
        niche: "crypto",
        text: "I was skeptical at first, but the AI replies are so natural. People actually click my links and buy. I do this 30 minutes a day.",
        avatar: "JR",
        color: "bg-blue-500",
        daysUsing: 32,
    },
    {
        name: "Maria L.",
        location: "California",
        earning: "$3,100/mo",
        niche: "skincare",
        text: "Best investment I ever made. The tool finds ads I would never find on my own. I just copy the reply and paste it. That simple.",
        avatar: "ML",
        color: "bg-purple-500",
        daysUsing: 61,
    },
    {
        name: "Derek T.",
        location: "Ohio",
        earning: "$4,200/mo",
        niche: "home gym",
        text: "I quit my 9-5 after 2 months of using this. The AI writes replies better than I ever could. I just paste and earn.",
        avatar: "DT",
        color: "bg-emerald-500",
        daysUsing: 83,
    },
    {
        name: "Ashley K.",
        location: "Georgia",
        earning: "$1,450/mo",
        niche: "dog food",
        text: "I'm a stay-at-home mom. I do this while my kids nap. Made my first $100 in 3 days. Now I make more than my old job.",
        avatar: "AK",
        color: "bg-orange-500",
        daysUsing: 28,
    },
    {
        name: "Carlos P.",
        location: "Arizona",
        earning: "$2,890/mo",
        niche: "supplements",
        text: "I tried 5 other tools before this one. Nothing compares. The ads it finds are pure gold and the replies actually convert.",
        avatar: "CP",
        color: "bg-cyan-500",
        daysUsing: 55,
    },
    {
        name: "Priya N.",
        location: "UK",
        earning: "$1,920/mo",
        niche: "keto diet",
        text: "English is my second language. The AI writes perfect replies for me. I never thought I could make money online this easily.",
        avatar: "PN",
        color: "bg-indigo-500",
        daysUsing: 39,
    },
    {
        name: "Ryan B.",
        location: "Canada",
        earning: "$5,100/mo",
        niche: "dating",
        text: "I run the tool on my phone during lunch break. 15 minutes, 5-10 replies, done. My affiliate checks keep growing every week.",
        avatar: "RB",
        color: "bg-rose-500",
        daysUsing: 92,
    },
    {
        name: "Tonya W.",
        location: "North Carolina",
        earning: "$780/mo",
        niche: "air fryers",
        text: "I just started 2 weeks ago and already earned $390. I can't believe this actually works. Showing all my friends.",
        avatar: "TW",
        color: "bg-amber-500",
        daysUsing: 14,
    },
];

export function EarningsTestimonials() {
    const [page, setPage] = useState(0);
    const perPage = 3;
    const totalPages = Math.ceil(TESTIMONIALS.length / perPage);

    useEffect(() => {
        const timer = setInterval(() => {
            setPage(p => (p + 1) % totalPages);
        }, 8000);
        return () => clearInterval(timer);
    }, [totalPages]);

    const visible = TESTIMONIALS.slice(page * perPage, page * perPage + perPage);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                        <DollarSign size={16} className="text-accent" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">Real Members, Real Earnings</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-widest">Verified results from our community</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)} className="w-7 h-7 rounded-lg bg-surface border border-border-dim flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 transition-all">
                        <ChevronLeft size={14} />
                    </button>
                    <span className="text-[10px] text-text-muted font-bold">{page + 1}/{totalPages}</span>
                    <button onClick={() => setPage(p => (p + 1) % totalPages)} className="w-7 h-7 rounded-lg bg-surface border border-border-dim flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 transition-all">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={page}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {visible.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card-base flex flex-col gap-4 hover:border-accent/20 transition-all relative"
                        >
                            <Quote size={32} className="absolute top-4 right-4 text-accent/5" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-xs font-black relative`}>
                                        {t.avatar}
                                        <BadgeCheck size={12} className="absolute -bottom-0.5 -right-0.5 text-blue-400 fill-[#111113]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-bold text-white">{t.name}</span>
                                        </div>
                                        <span className="text-[10px] text-text-muted">{t.location} · {t.niche}</span>
                                    </div>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                                    <span className="text-green-400 text-xs font-black">{t.earning}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={12} className="text-accent fill-accent" />
                                    ))}
                                </div>
                                <span className="text-[9px] text-text-muted font-medium">using for {t.daysUsing} days</span>
                            </div>

                            <p className="text-[13px] text-text-secondary leading-relaxed italic">
                                &ldquo;{t.text}&rdquo;
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === page ? "bg-accent w-6" : "bg-border-dim hover:bg-text-muted"}`}
                    />
                ))}
            </div>
        </div>
    );
}
