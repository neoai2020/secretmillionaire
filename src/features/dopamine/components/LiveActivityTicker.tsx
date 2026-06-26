"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, Users } from "lucide-react";
import { socialProof } from "@/config/social-proof.config";
import { brand } from "@/config/brand.config";

export function LiveActivityTicker() {
  const [index, setIndex] = useState(0);
  const messages = [...socialProof.ticker.messages];
  const onlineCount = socialProof.ticker.onlineCount;

  useEffect(() => {
    if (messages.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  if (!socialProof.enabled || messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {onlineCount > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: "rgba(212, 175, 55, 0.06)",
            borderColor: "rgba(212, 175, 55, 0.2)",
          }}
        >
          <Users size={11} className="shrink-0" style={{ color: brand.colors.vaultGold }} />
          <span className="text-[10px] font-bold" style={{ color: brand.colors.vaultGold }}>
            {onlineCount} members online
          </span>
          <Circle
            size={5}
            className="ml-auto shrink-0 animate-pulse"
            style={{ color: brand.colors.encryptedGreen, fill: brand.colors.encryptedGreen }}
          />
        </div>
      )}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg border overflow-hidden"
        style={{
          backgroundColor: "rgba(69, 162, 158, 0.06)",
          borderColor: "rgba(69, 162, 158, 0.2)",
        }}
      >
        <Circle
          size={5}
          className="shrink-0 animate-pulse"
          style={{ color: brand.colors.encryptedGreen, fill: brand.colors.encryptedGreen }}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
            style={{ color: brand.colors.encryptedGreen }}
          >
            {messages[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
