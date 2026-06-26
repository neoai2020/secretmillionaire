"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign } from "lucide-react";
import { socialProof } from "@/config/social-proof.config";
import { brand } from "@/config/brand.config";

interface SocialProofToastProps {
  paused?: boolean;
}

export function SocialProofToast({ paused = false }: SocialProofToastProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const messages = [...socialProof.toast.messages];
  const green = brand.colors.encryptedGreen;
  const gold = brand.colors.vaultGold;

  const showNext = useCallback(() => {
    if (paused || messages.length === 0) return;
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
    setIndex((prev) => (prev + 1) % messages.length);
  }, [paused, messages.length]);

  useEffect(() => {
    if (paused || !socialProof.enabled || messages.length === 0) {
      setVisible(false);
      return;
    }

    const initialDelay = setTimeout(() => showNext(), 8000);
    const interval = setInterval(
      () => showNext(),
      socialProof.toast.intervalMinMs +
        Math.random() * (socialProof.toast.intervalMaxMs - socialProof.toast.intervalMinMs)
    );

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [showNext, paused, messages.length]);

  if (!socialProof.enabled || messages.length === 0) return null;

  const current = messages[index];

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-6 left-6 z-50 w-[min(calc(100vw-3rem),20rem)]"
        >
          <div
            className="rounded-2xl border p-4 flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#0A0D10]"
            style={{ borderColor: `${green}33` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${green}1A`, border: `1px solid ${green}26` }}
            >
              <DollarSign size={18} style={{ color: green }} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[13px] text-white font-medium leading-snug">
                {current.name} {current.action}{" "}
                <span className="font-bold" style={{ color: gold }}>
                  {current.amount}
                </span>
              </p>
              <span className="text-[10px] text-text-muted">Just now · Verified</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
