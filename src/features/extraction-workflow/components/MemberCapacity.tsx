"use client";

import { socialProof } from "@/config/social-proof.config";

export function MemberCapacity() {
  const { current, max } = socialProof.networkCapacity;

  const pct = (current / max) * 100;

  return (
    <div className="px-3 py-2.5 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
        <span className="text-[#D4AF37]">Network Capacity</span>
        <span className="text-[#C5C6C7]">
          {current}/{max} Members Online
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1a1c24] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#45A29E] to-[#D4AF37] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
