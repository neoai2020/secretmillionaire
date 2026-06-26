"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, Users, Radio, ShieldCheck } from "lucide-react";
import { socialProof } from "@/config/social-proof.config";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";

export function SidebarStatusPanel() {
  const showDopamine = isFeatureEnabled("dopamine");
  const showExtraction = isFeatureEnabled("extraction-workflow");
  const { connected } = useExtraction();

  const [index, setIndex] = useState(0);
  const messages = [...socialProof.ticker.messages];
  const onlineCount = socialProof.ticker.onlineCount;
  const { current, max } = socialProof.networkCapacity;
  const capacityPct = (current / max) * 100;

  useEffect(() => {
    if (!showDopamine || messages.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showDopamine, messages.length]);

  if (!showDopamine && !showExtraction) return null;
  if (!socialProof.enabled) return null;

  const green = brand.colors.encryptedGreen;
  const gold = brand.colors.vaultGold;

  return (
    <div
      className="relative mx-1 rounded-[14px] border border-[#1e2128] bg-[#0A0D10] p-3.5 flex flex-col gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
      style={{ boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px ${green}0D` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-[14px] opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${gold}66, ${green}66, transparent)` }}
        aria-hidden
      />

      <div className="flex items-center gap-2">
        <Radio size={12} className="shrink-0" style={{ color: gold }} />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: gold }}>
          Live Network
        </span>
      </div>

      {showDopamine && onlineCount > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: `${gold}0F`,
            borderColor: `${gold}33`,
          }}
        >
          <Users size={12} className="shrink-0" style={{ color: gold }} />
          <span className="text-[10px] font-bold" style={{ color: gold }}>
            {onlineCount} members online
          </span>
          <Circle
            size={5}
            className="ml-auto shrink-0 animate-pulse"
            style={{ color: green, fill: green }}
          />
        </div>
      )}

      {showDopamine && messages.length > 0 && (
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border min-h-[40px]"
          style={{
            backgroundColor: `${green}0F`,
            borderColor: `${green}33`,
          }}
        >
          <Circle
            size={6}
            className="shrink-0 animate-pulse"
            style={{ color: green, fill: green }}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-[10px] font-bold leading-snug tracking-wide"
              style={{ color: green }}
            >
              {messages[index]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {showExtraction && (
        <>
          <div className="h-px bg-[#1e2128]" />
          <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <span style={{ color: gold }}>Network Capacity</span>
              <span className="text-[#C5C6C7]">
                {current}/{max}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#1a1c24] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${green}, ${gold})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${capacityPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1e2128] bg-[#0B0C10]"
          >
            <ShieldCheck
              size={12}
              className="shrink-0"
              style={{ color: connected ? green : brand.colors.textMuted }}
            />
            <span className="text-[10px] font-medium text-[#C5C6C7] leading-snug">
              Server:{" "}
              <span style={{ color: connected ? green : brand.colors.textMuted }}>
                {connected ? "Encrypted & Active" : "Awaiting Connection"}
              </span>
            </span>
            <Circle
              size={5}
              className={`ml-auto shrink-0 ${connected ? "animate-pulse" : ""}`}
              style={{
                color: connected ? green : brand.colors.textMuted,
                fill: connected ? green : brand.colors.textMuted,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
