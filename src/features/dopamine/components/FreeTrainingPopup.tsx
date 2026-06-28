"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { PARTNER_LINK_PLACEHOLDER } from "@/config/offers.config";

const CTA_URL = PARTNER_LINK_PLACEHOLDER;
const SESSION_KEY = "sms_training_popup";

const SPARKLE_POSITIONS = [
    { left: "8%", top: "12%" }, { left: "88%", top: "8%" },
    { left: "5%", top: "45%" }, { left: "93%", top: "40%" },
    { left: "12%", top: "78%" }, { left: "85%", top: "75%" },
    { left: "20%", top: "5%" }, { left: "75%", top: "3%" },
    { left: "3%", top: "60%" }, { left: "95%", top: "58%" },
    { left: "15%", top: "92%" }, { left: "80%", top: "90%" },
    { left: "50%", top: "2%" }, { left: "45%", top: "95%" },
    { left: "30%", top: "8%" }, { left: "65%", top: "6%" },
];

const SPARKLE_COLORS = ["#D4AF37", "#10B981", "#EAB308", "#F59E0B", "#34D399"];

export function FreeTrainingPopup() {
    const [visible, setVisible] = useState(false);

    const sparkles = useMemo(() =>
        SPARKLE_POSITIONS.map((pos, i) => ({
            ...pos,
            color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
            size: 2 + (i % 3),
            duration: 1.8 + (i % 4) * 0.5,
            delay: (i % 5) * 0.6,
        })), []);

    useEffect(() => {
        if (process.env.NODE_ENV === "production" && sessionStorage.getItem(SESSION_KEY)) return;
        const timer = setTimeout(() => {
            if (process.env.NODE_ENV === "production") {
                sessionStorage.setItem(SESSION_KEY, "1");
            }
            setVisible(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => setVisible(false);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <div className="absolute inset-0 bg-black/75" />

                    {/* Sparkle dots around the modal area */}
                    <div className="absolute inset-0 pointer-events-none">
                        {sparkles.map((s, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    left: s.left,
                                    top: s.top,
                                    width: s.size,
                                    height: s.size,
                                    backgroundColor: s.color,
                                }}
                                animate={{ opacity: [0, 1, 0.3, 1, 0] }}
                                transition={{
                                    duration: s.duration,
                                    repeat: Infinity,
                                    delay: s.delay,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-[440px] rounded-2xl overflow-visible"
                    >
                        {/* Card */}
                        <div
                            className="relative rounded-2xl overflow-hidden"
                            style={{
                                background: "#141614",
                                border: "1px solid rgba(212, 175, 55, 0.18)",
                                boxShadow: "0 0 60px rgba(212, 175, 55, 0.08), 0 25px 50px rgba(0,0,0,0.7)",
                            }}
                        >
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                                style={{ background: "rgba(255,255,255,0.06)" }}
                            >
                                <X size={18} strokeWidth={2} />
                            </button>

                            <div className="relative z-10 px-10 pt-10 pb-8 flex flex-col items-center text-center">
                                {/* Trophy */}
                                <div
                                    className="w-[76px] h-[76px] rounded-full flex items-center justify-center -mt-1 mb-5"
                                    style={{
                                        background: "linear-gradient(145deg, #E8A910 0%, #C4880A 100%)",
                                        boxShadow: "0 0 35px rgba(232, 169, 16, 0.35), 0 6px 20px rgba(0,0,0,0.4)",
                                    }}
                                >
                                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                        <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                    </svg>
                                </div>

                                {/* Headline */}
                                <p className="text-[12px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: "#34D399" }}>
                                    ✨ You&apos;ve Been Selected ✨
                                </p>

                                <h2
                                    className="text-[28px] sm:text-[32px] font-black text-white leading-none tracking-tight mb-2"
                                    style={{ fontFamily: "var(--font-brand)" }}
                                >
                                    LIMITED FREE TRAINING
                                </h2>

                                <p className="text-[15px] font-semibold mb-0.5">
                                    <span className="text-white">Learn How To Make </span>
                                    <span style={{ color: "#34D399" }}>$1,000</span>
                                    <span className="text-white"> — </span>
                                    <span style={{ color: "#34D399" }}>$5,000</span>
                                    <span className="text-white"> Per Day</span>
                                </p>

                                <p className="text-[13px] mb-6" style={{ color: "#8B9A8B" }}>With No Extra Work</p>

                                {/* Progress section */}
                                <div className="w-full mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#D4AF37" }}>
                                            🔥 Spots Filling Fast
                                        </span>
                                        <span className="text-[12px] font-bold text-gray-400">
                                            <span className="text-white font-black">8</span> / 10 Claimed
                                        </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#1e211e" }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "80%" }}
                                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ background: "#EF4444" }}
                                        />
                                    </div>
                                    <p className="text-[12px] font-semibold mt-1.5" style={{ color: "#34D399" }}>
                                        Only 2 FREE spots remaining!
                                    </p>
                                </div>

                                {/* Bullet points */}
                                <div className="w-full flex flex-col gap-3 text-left mb-7">
                                    {[
                                        "Fully automated income system revealed",
                                        "No tech skills or experience needed",
                                        "Works in just 20 minutes per day",
                                    ].map((text) => (
                                        <div key={text} className="flex items-center gap-3">
                                            <span className="text-[15px] shrink-0">⭐</span>
                                            <span className="text-[14px] text-gray-300">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <motion.a
                                    href={CTA_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleClose}
                                    whileHover={{ scale: 1.02, boxShadow: "0 6px 28px rgba(234, 179, 8, 0.45)" }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[15px] uppercase tracking-wide cursor-pointer mb-3"
                                    style={{
                                        background: "#EAB308",
                                        color: "#000",
                                        border: "2px solid #D4AF37",
                                        boxShadow: "0 4px 20px rgba(234, 179, 8, 0.25)",
                                    }}
                                >
                                    <span className="text-lg">🎁</span>
                                    <span>CLAIM MY FREE SPOT</span>
                                    <ArrowRight size={18} strokeWidth={2.5} />
                                </motion.a>

                                <p className="text-[11px]" style={{ color: "#6B7B6B" }}>
                                    100% Free — No credit card required
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
