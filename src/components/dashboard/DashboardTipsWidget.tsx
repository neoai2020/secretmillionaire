"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

const TIPS = [
  {
    title: "What to do next",
    body: "Pick one niche and stick with it — consistency beats jumping between topics.",
  },
  {
    title: "Tip",
    body: "Add your affiliate links before launching — every click counts toward commissions.",
  },
  {
    title: "Tip",
    body: "Use Accelerator to generate Facebook posts for your live websites.",
  },
  {
    title: "Tip",
    body: "Check My Websites regularly to see which articles get the most clicks.",
  },
];

export function DashboardTipsWidget() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 12000);
    return () => window.clearInterval(timer);
  }, []);

  const tip = TIPS[tipIndex];

  return (
    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-[#D4AF37] shrink-0" />
        <p className="text-sm font-semibold text-[#E2E8F0]">{tip.title}</p>
      </div>
      <p className="text-sm leading-relaxed text-[#9fb0b5]">{tip.body}</p>
      <p className="mt-3 text-xs text-[#6b7280] italic">Individual results vary.</p>
    </div>
  );
}
