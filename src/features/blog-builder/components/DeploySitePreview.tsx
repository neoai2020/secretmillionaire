"use client";

import { motion } from "framer-motion";
import { Globe, Link2 } from "lucide-react";
import type { BlogSite } from "../types";

interface DeploySitePreviewProps {
  site: BlogSite;
}

export function DeploySitePreview({ site }: DeploySitePreviewProps) {
  const armedCount = site.armed_links?.length ?? 0;
  const publicPath = `/sites/${site.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#D4AF37]/35 bg-gradient-to-br from-[#D4AF37]/8 to-transparent p-5 sm:p-6"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
        Cash asset initialized
      </p>
      <h2 className="brand-font text-xl sm:text-2xl text-[#C5C6C7] tracking-tight">{site.title}</h2>
      {site.tagline && <p className="text-sm text-[#6b7280] mt-1">{site.tagline}</p>}

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#45A29E]/30 bg-[#45A29E]/10 px-3 py-1.5 text-[#45A29E]">
          <Globe size={14} />
          Topic: {site.hobby}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2128] bg-[#12141a] px-3 py-1.5 text-[#C5C6C7]">
          <Link2 size={14} className="text-[#D4AF37]" />
          {armedCount} product link{armedCount === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2128] bg-[#12141a] px-3 py-1.5 text-[#6b7280] font-mono truncate max-w-full">
          {publicPath}
        </span>
      </div>
    </motion.div>
  );
}
