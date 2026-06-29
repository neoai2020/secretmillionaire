"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { GenerationQuota } from "../types";

export function GenerationQuotaWidget({ className = "" }: { className?: string }) {
  const [quota, setQuota] = useState<GenerationQuota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog/quota", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.quota) setQuota(data.quota as GenerationQuota);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className={`rounded-xl border border-white/10 bg-[#0B0C10]/80 p-4 flex items-center gap-3 ${className}`}
      >
        <Loader2 className="animate-spin text-[#45A29E]" size={18} />
        <span className="text-sm text-[#6b7280]">Loading generations…</span>
      </div>
    );
  }

  if (!quota) return null;

  const pct = quota.limit > 0 ? Math.round((quota.remaining / quota.limit) * 100) : 0;
  const depleted = quota.remaining <= 0;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
        depleted
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-[#45A29E]/30 bg-gradient-to-br from-[#45A29E]/10 to-[#0B0C10]/60"
      } ${className}`}
      style={
        depleted
          ? undefined
          : { boxShadow: "0 0 32px rgba(69, 162, 158, 0.12)" }
      }
    >
      <div
        className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
          depleted ? "bg-amber-500/15 text-amber-400" : "bg-[#45A29E]/15 text-[#45A29E]"
        }`}
      >
        <Sparkles size={22} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">
            Daily money-site generations
          </p>
          <p
            className={`text-2xl sm:text-3xl font-bold tabular-nums ${
              depleted ? "text-amber-400" : "text-[#45A29E]"
            }`}
          >
            {quota.remaining}
            <span className="text-base font-medium text-[#6b7280]"> / {quota.limit}</span>
          </p>
        </div>

        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              depleted ? "bg-amber-500/70" : "bg-[#45A29E]"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-xs text-[#6b7280] leading-relaxed">
          {depleted ? (
            <>You&apos;ve used all {quota.limit} generations today. Resets at midnight UTC.</>
          ) : (
            <>
              {quota.remaining} {quota.remaining === 1 ? "generation" : "generations"} left today
              {quota.usedToday > 0 && (
                <>
                  {" "}
                  · {quota.usedToday} already used
                </>
              )}
              . Resets at midnight UTC.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
