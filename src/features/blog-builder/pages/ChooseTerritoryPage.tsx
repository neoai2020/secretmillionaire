"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { useBlogBuilder } from "../context/BlogBuilderContext";
import { SuggestionGrid } from "../components/SuggestionGrid";
import { localTerritorySuggestions } from "../lib/local-territory-suggestions";

export default function ChooseTerritoryPage() {
  const router = useRouter();
  const { hobby, territory, suggestions, setHobby, setTerritory, setSuggestions, chooseTerritory } =
    useBlogBuilder();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestHint, setSuggestHint] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    const trimmed = hobby.trim();
    if (!trimmed) {
      setSuggestError(null);
      setSuggestHint("Enter a hobby or interest above first — e.g. fly fishing, yoga, crypto.");
      return;
    }

    setSuggestHint(null);
    setSuggestError(null);
    setFetching(true);

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
            ? `${data.error} — showing starter territories below.`
            : "Could not reach AI — showing starter territories below."
        );
        return;
      }

      if (data.suggestions?.length) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(localTerritorySuggestions(trimmed));
        setSuggestError("No AI suggestions returned — showing starter territories below.");
      }
    } catch {
      setSuggestions(localTerritorySuggestions(trimmed));
      setSuggestError("Network error — showing starter territories below.");
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
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Click 1</p>
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-text-heading tracking-tight">
          Choose Territory
        </h1>
        <p className="text-[#6b7280] text-sm sm:text-base max-w-2xl leading-relaxed">
          Enter a hobby you enjoy — or let the system suggest profitable territories your money site
          can rank for.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">
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
          placeholder="e.g. fly fishing, yoga, crypto..."
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
              Scanning territories…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Suggest profitable territories
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
      </div>

      <SuggestionGrid
        suggestions={suggestions}
        selected={territory}
        onSelect={setTerritory}
        loading={fetching}
      />

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
              Locking territory...
            </>
          ) : (
            <>
              <MapPin size={22} />
              Arm Your Links
              <ArrowRight size={22} />
            </>
          )}
        </span>
      </motion.button>
    </div>
  );
}
