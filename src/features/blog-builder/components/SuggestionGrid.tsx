"use client";

import { motion } from "framer-motion";
import { AiLoadingBar } from "@/components/ui/AiLoadingBar";

interface SuggestionGridProps {
  suggestions: string[];
  selected: string;
  onSelect: (s: string) => void;
  loading?: boolean;
}

export function SuggestionGrid({
  suggestions,
  selected,
  onSelect,
  loading,
}: SuggestionGridProps) {
  if (loading) {
    return (
      <div className="glass-card p-6 flex flex-col gap-4">
        <AiLoadingBar label="Scanning profitable territories" />
        <p className="text-xs text-text-muted text-center">
          This can take 10–30 seconds while AI maps your best angles.
        </p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <p className="text-xs text-text-muted text-center py-2">
        Territory suggestions will appear here after you click Suggest.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {suggestions.map((s) => (
        <motion.button
          key={s}
          type="button"
          whileHover={{ scale: 1.01 }}
          onClick={() => onSelect(s)}
          className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
            selected === s
              ? "border-accent/50 glass-surface text-text-heading shadow-[var(--glow-teal)]"
              : "glass-tile text-text-primary hover:border-accent/30"
          }`}
        >
          {s}
        </motion.button>
      ))}
    </div>
  );
}
