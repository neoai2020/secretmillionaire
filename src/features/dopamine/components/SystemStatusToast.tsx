"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Radio, Activity, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { socialProof } from "@/config/social-proof.config";
import { brand } from "@/config/brand.config";

const STATUS_ICONS: LucideIcon[] = [ShieldCheck, Radio, Activity, Lock];

interface SystemStatusToastProps {
  paused?: boolean;
}

export function SystemStatusToast({ paused = false }: SystemStatusToastProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const messages = [...socialProof.ticker.messages];
  const green = brand.colors.encryptedGreen;
  const gold = brand.colors.vaultGold;

  useEffect(() => {
    if (paused || !socialProof.enabled || messages.length === 0) {
      setVisible(false);
      return;
    }

    const { initialDelayMs, intervalMinMs, intervalMaxMs, visibleMs } = socialProof.systemStatus;

    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      setVisible(true);
      timer = setTimeout(() => {
        setVisible(false);
        const gap = intervalMinMs + Math.random() * (intervalMaxMs - intervalMinMs);
        timer = setTimeout(() => {
          setIndex((prev) => (prev + 1) % messages.length);
          schedule();
        }, gap);
      }, visibleMs);
    };

    timer = setTimeout(schedule, initialDelayMs);
    return () => clearTimeout(timer);
  }, [paused, messages.length]);

  if (!socialProof.enabled || messages.length === 0) return null;

  const Icon = STATUS_ICONS[index % STATUS_ICONS.length];
  const message = messages[index];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 48, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 32, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed top-20 right-4 sm:right-6 z-[55] w-[min(calc(100vw-2rem),20rem)] pointer-events-none"
        >
          <div
            className="relative overflow-hidden rounded-xl border bg-[#0A0D10]/95 backdrop-blur-md p-4 shadow-[0_16px_48px_rgba(0,0,0,0.65)]"
            style={{
              borderColor: `${green}40`,
              boxShadow: `0 16px 48px rgba(0,0,0,0.65), 0 0 24px ${green}14`,
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${gold}, ${green}, ${gold})` }}
              aria-hidden
            />

            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: `${green}1A`,
                  border: `1px solid ${green}33`,
                }}
              >
                <Icon size={18} style={{ color: green }} />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: green, boxShadow: `0 0 6px ${green}` }}
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ color: gold }}
                  >
                    Node Status
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-white leading-snug">{message}</p>
                <span className="text-[10px] text-text-muted mt-1 block">Just now · Verified</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
