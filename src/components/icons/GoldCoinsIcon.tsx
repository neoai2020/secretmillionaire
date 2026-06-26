"use client";

import { motion } from "framer-motion";

interface GoldCoinsIconProps {
  size?: number;
  className?: string;
}

/** Gold coin stack — inspired by classic open clip art coin stacks */
export function GoldCoinsIcon({ size = 64, className = "" }: GoldCoinsIconProps) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="goldCoinFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E6A3" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="goldCoinEdge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8C547" />
          <stop offset="100%" stopColor="#9A7B0A" />
        </linearGradient>
        <radialGradient id="goldCoinShine" cx="35%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#FFF8DC" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <filter id="coinGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#D4AF37" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Back stack */}
      <ellipse cx="22" cy="44" rx="14" ry="5" fill="#6B5410" opacity="0.5" />
      <ellipse cx="22" cy="40" rx="14" ry="5" fill="url(#goldCoinEdge)" />
      <ellipse cx="22" cy="38" rx="14" ry="5" fill="url(#goldCoinFace)" filter="url(#coinGlow)" />
      <ellipse cx="22" cy="38" rx="10" ry="3.5" fill="url(#goldCoinShine)" />

      {/* Middle stack */}
      <ellipse cx="42" cy="46" rx="15" ry="5.5" fill="#6B5410" opacity="0.5" />
      <ellipse cx="42" cy="42" rx="15" ry="5.5" fill="url(#goldCoinEdge)" />
      <ellipse cx="42" cy="40" rx="15" ry="5.5" fill="url(#goldCoinFace)" filter="url(#coinGlow)" />
      <ellipse cx="42" cy="40" rx="11" ry="4" fill="url(#goldCoinShine)" />

      {/* Front hero coin */}
      <ellipse cx="32" cy="50" rx="17" ry="6" fill="#5C4A0E" opacity="0.55" />
      <path
        d="M15 32 C15 28 22 25 32 25 C42 25 49 28 49 32 L49 38 C49 42 42 45 32 45 C22 45 15 42 15 38 Z"
        fill="url(#goldCoinEdge)"
      />
      <ellipse cx="32" cy="32" rx="17" ry="6" fill="url(#goldCoinFace)" filter="url(#coinGlow)" />
      <ellipse cx="32" cy="32" rx="12" ry="4" fill="url(#goldCoinShine)" />
      {/* $ mark on front coin */}
      <text
        x="32"
        y="35"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#8B6914"
        fontFamily="Georgia, serif"
      >
        $
      </text>
    </motion.svg>
  );
}

export function GoldCoinsIconRing({ size = 72 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-70"
        style={{
          background: `conic-gradient(from 0deg, #45A29E, #D4AF37, #45A29E)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="relative z-10 flex items-center justify-center rounded-2xl w-full h-full"
        style={{
          background: "linear-gradient(145deg, rgba(212,175,55,0.2) 0%, rgba(11,12,16,0.92) 100%)",
          boxShadow: "0 0 28px rgba(212, 175, 55, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.08)",
        }}
      >
        <GoldCoinsIcon size={size * 0.62} />
      </div>
    </div>
  );
}
