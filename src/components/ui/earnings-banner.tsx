"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { trainingContent } from "@/config/training.config";

/** Secret Millionaire Society Free Training — same URL as sidebar / global promo (do not change). */
const FREE_TRAINING_URL = trainingContent.externalTrainingUrl;

export function EarningsBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative mb-4 w-full rounded-2xl border-2 border-[#fbbf24]/50 bg-gradient-to-b from-[#101726] to-[#0b0f18] px-6 py-10 text-center md:px-12 md:py-12">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Close banner"
        className="absolute right-3 top-3 rounded-lg p-1.5 text-[#7dd3fc]/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <span className="mb-5 inline-block rounded-md bg-[#ef4444] px-4 py-1.5 text-sm font-black uppercase tracking-widest text-white md:text-base">
        Free Training
      </span>

      <h2 className="mx-auto mb-4 max-w-4xl text-3xl font-black uppercase leading-tight text-white md:text-5xl">
        Wake Up With An Extra{" "}
        <span className="text-[#fbbf24]">$1,000&ndash;$5,000</span> In Your Bank Account Tomorrow
      </h2>

      <p className="mx-auto mb-8 max-w-3xl text-lg font-bold leading-snug text-[#d8e9fb] md:text-2xl">
        Discover how to scale to $1,000&ndash;$5,000 every single day &mdash; without doing any extra work.
      </p>

      <a
        href={FREE_TRAINING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] px-10 py-5 text-xl font-black uppercase text-white shadow-xl shadow-[#fbbf24]/40 transition-all duration-200 hover:scale-[1.04] hover:shadow-[#fbbf24]/60 md:text-2xl"
      >
        Watch The Free Training &gt;&gt;
      </a>

      <p className="mt-4 text-sm font-black uppercase tracking-wide text-[#ef4444] md:text-base">
        Warning: This will be taken down soon
      </p>
    </div>
  );
}
