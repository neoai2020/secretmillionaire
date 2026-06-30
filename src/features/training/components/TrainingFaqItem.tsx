"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export function TrainingFaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border-dim/20 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <HelpCircle size={15} className="text-accent shrink-0" />
          <span className="text-sm font-semibold text-text-primary">{q}</span>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-text-muted shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-text-muted shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-12">
              <p className="text-[13px] text-text-secondary leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
