"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const NODES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 10 + ((i * 37) % 80),
  y: 15 + ((i * 23 + i * i) % 65),
  delay: (i % 5) * 0.4,
}));

export function GlobalNetworkMap({ active }: { active: boolean }) {
  const nodes = useMemo(() => NODES, []);

  return (
    <div className="relative w-full min-h-[200px] sm:min-h-[240px] aspect-[4/3] sm:aspect-[16/9] max-h-[280px] sm:max-h-[340px] rounded-2xl border border-[#45A29E]/20 bg-[#08090d] overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(69,162,158,0.15) 0%, transparent 60%), linear-gradient(rgba(69,162,158,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(69,162,158,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            backgroundColor: active ? "#45A29E" : "#3a3f4b",
            boxShadow: active ? "0 0 12px rgba(69,162,158,0.8)" : "none",
          }}
          animate={active ? { opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] } : { opacity: 0.3 }}
          transition={{ duration: 2 + node.delay, repeat: Infinity, delay: node.delay }}
        />
      ))}
      <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 flex flex-col sm:flex-row sm:justify-between gap-1 text-[9px] sm:text-[10px] text-[#6b7280] uppercase tracking-widest">
        <span>Global Wi-Fi Signals</span>
        <span className={active ? "text-[#45A29E]" : ""}>
          {active ? "Private Node Linked" : "Scanning frequencies..."}
        </span>
      </div>
    </div>
  );
}
