"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { trainingContent } from "@/config/training.config";

/** Secret Millionaire Society Free Training — same URL as sidebar / global promo (do not change). */
const FREE_TRAINING_URL = trainingContent.externalTrainingUrl;

export function EarningsBanner({ compact = false }: { compact?: boolean }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={clsx(
        "relative mb-4 w-full rounded-2xl border-2 border-[#fbbf24]/50 bg-gradient-to-b from-[#101726] to-[#0b0f18] text-center transition-all duration-300",
        compact ? "px-3 py-4 md:px-4 md:py-5" : "px-6 py-10 md:px-12 md:py-12"
      )}
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Close banner"
        className="absolute right-2 top-2 rounded-lg p-1 text-[#7dd3fc]/60 transition-colors hover:bg-white/10 hover:text-white md:right-3 md:top-3 md:p-1.5"
      >
        <X className={clsx(compact ? "h-4 w-4" : "h-5 w-5")} />
      </button>

      <span
        className={clsx(
          "mb-3 inline-block rounded-md bg-[#ef4444] px-3 py-1 font-black uppercase tracking-widest text-white md:mb-5",
          compact ? "text-[10px] md:text-xs" : "text-sm md:text-base"
        )}
      >
        Free Training
      </span>

      <h2
        className={clsx(
          "mx-auto font-black uppercase leading-tight text-white",
          compact ? "mb-2 max-w-xl text-sm md:text-base" : "mb-4 max-w-4xl text-3xl md:text-5xl"
        )}
      >
        Wake Up With An Extra{" "}
        <span className="text-[#fbbf24]">$1,000&ndash;$5,000</span> In Your Bank Account Tomorrow
      </h2>

      <p
        className={clsx(
          "mx-auto font-bold leading-snug text-[#d8e9fb]",
          compact ? "mb-3 max-w-lg text-xs md:text-sm" : "mb-8 max-w-3xl text-lg md:text-2xl"
        )}
      >
        Discover how to scale to $1,000&ndash;$5,000 every single day &mdash; without doing any extra work.
      </p>

      <a
        href={FREE_TRAINING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          "inline-block rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] font-black uppercase text-white shadow-xl shadow-[#fbbf24]/40 transition-all duration-200 hover:scale-[1.04] hover:shadow-[#fbbf24]/60",
          compact ? "px-4 py-2 text-xs md:px-5 md:py-2.5 md:text-sm" : "px-10 py-5 text-xl md:text-2xl"
        )}
      >
        Watch The Free Training &gt;&gt;
      </a>

      {!compact && (
        <p className="mt-4 text-sm font-black uppercase tracking-wide text-[#ef4444] md:text-base">
          Warning: This will be taken down soon
        </p>
      )}
    </div>
  );
}
