"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { useBlogBuilder } from "../context/BlogBuilderContext";
import { SuggestionGrid } from "../components/SuggestionGrid";
import { GenerationQuotaWidget } from "../components/GenerationQuotaWidget";
import { localTerritorySuggestions } from "../lib/local-territory-suggestions";
import { PageHeader } from "@/components/ui/page-header";
import { GenerationProgress } from "@/components/ui/generation-progress";
import { EarningsBanner } from "@/components/ui/earnings-banner";
import { useScrollToResult } from "@/hooks/useScrollToResult";

export default function ChooseTerritoryPage() {
  const router = useRouter();
  const { hobby, territory, suggestions, setHobby, setTerritory, setSuggestions, chooseTerritory } =
    useBlogBuilder();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestHint, setSuggestHint] = useState<string | null>(null);
  const [showOfferBanner, setShowOfferBanner] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useScrollToResult(fetching, resultsRef);

  const fetchSuggestions = async () => {
    const trimmed = hobby.trim();
    if (!trimmed) {
      setSuggestError(null);
      setSuggestHint("Type a hobby or interest in the box above first — for example: gardening, fishing, or cooking.");
      return;
    }

    setSuggestHint(null);
    setSuggestError(null);
    setFetching(true);
    setShowOfferBanner(true);

    try {
      const res = await fetch("/api/blog/suggest-territories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobby: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        const fallback = localTerritorySuggestions(trimmed);
        setSuggestions(fallback);
        setSuggestError(
          data.error
            ? `${data.error} — showing starter topic ideas below.`
            : "Could not reach AI — showing starter topic ideas below."
        );
        return;
      }

      if (data.suggestions?.length) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(localTerritorySuggestions(trimmed));
        setSuggestError("No AI suggestions returned — showing starter topic ideas below.");
      }
    } catch {
      setSuggestions(localTerritorySuggestions(trimmed));
      setSuggestError("Network error — showing starter topic ideas below.");
    } finally {
      setFetching(false);
    }
  };

  const handleContinue = async () => {
    const picked = (territory || hobby).trim();
    if (!picked) return;
    setLoading(true);
    chooseTerritory(picked);
    router.push("/arm-links");
  };

  return (
    <div className="page-stack w-full page-container">
      <PageHeader
        eyebrow="Step 1"
        title="Pick Your Topic"
        subtitle="What will your website be about? Type in a hobby or interest you enjoy — or press the button and we'll suggest good topics for you."
      />

      <GenerationQuotaWidget />

      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-widest text-[#9fb0b5]">
          Your hobby or interest
        </label>
        <input
          type="text"
          value={hobby}
          onChange={(e) => {
            setHobby(e.target.value);
            if (suggestHint) setSuggestHint(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void fetchSuggestions();
            }
          }}
          placeholder="e.g. gardening, fishing, cooking..."
          className="input-base w-full py-4"
        />
        <button
          type="button"
          onClick={() => void fetchSuggestions()}
          disabled={fetching}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-[#45A29E]/40 bg-[#45A29E]/10 px-4 py-2.5 text-sm font-semibold text-[#45A29E] hover:bg-[#45A29E]/15 disabled:opacity-60 transition-colors"
        >
          {fetching ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Finding topic ideas…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Suggest topics for me
              <ArrowRight size={16} />
            </>
          )}
        </button>
        {suggestHint && (
          <p className="text-sm text-[#D4AF37]/90 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3">
            {suggestHint}
          </p>
        )}
        {suggestError && (
          <p className="text-sm text-amber-400/90 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            {suggestError}
          </p>
        )}
        {fetching && <GenerationProgress label="Finding topic ideas for your website…" />}
      </div>

      {showOfferBanner && !fetching && suggestions.length > 0 && <EarningsBanner />}

      <div ref={resultsRef} className="scroll-mt-24">
        <SuggestionGrid
          suggestions={suggestions}
          selected={territory}
          onSelect={setTerritory}
          loading={fetching}
        />
      </div>

      <motion.button
        type="button"
        onClick={handleContinue}
        disabled={loading || !(territory || hobby).trim()}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        className="w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
          boxShadow: "0 0 40px rgba(69, 162, 158, 0.35)",
        }}
      >
        <span className="flex items-center justify-center gap-3">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={22} />
              Saving your topic...
            </>
          ) : (
            <>
              <MapPin size={22} />
              Next: Add Your Links
              <ArrowRight size={22} />
            </>
          )}
        </span>
      </motion.button>
    </div>
  );
}
