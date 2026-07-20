"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lightbulb, Globe, FileText, MousePointerClick } from "lucide-react";

const TIPS = [
  "Pick one niche and stick with it — consistency beats jumping between topics.",
  "Add your affiliate links before launching — every click counts toward commissions.",
  "Use Accelerator to generate Facebook posts for your live websites.",
  "Check My Websites regularly to see which articles get the most clicks.",
  "Social Payouts gives you ready-made posts — paste your link and share in groups.",
  "Individual results vary. Focus on showing up daily rather than overnight wins.",
];

interface DashboardStats {
  websites: number;
  articles: number;
  clicks: number;
}

export function HonestActivity({ stats }: { stats?: DashboardStats }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [localStats, setLocalStats] = useState<DashboardStats>({
    websites: 0,
    articles: 0,
    clicks: 0,
  });

  useEffect(() => {
    if (stats) {
      setLocalStats(stats);
      return;
    }
    let cancelled = false;
    fetch("/api/blog/site", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const summaries = Array.isArray(data.summaries) ? data.summaries : [];
        setLocalStats({
          websites: summaries.length,
          articles: summaries.reduce(
            (sum: number, s: { livePostCount?: number; postCount?: number }) =>
              sum + (s.livePostCount ?? s.postCount ?? 0),
            0,
          ),
          clicks: summaries.reduce(
            (sum: number, s: { clickCount?: number }) => sum + (s.clickCount ?? 0),
            0,
          ),
        });
      })
      .catch(() => {
        /* leave zeros */
      });
    return () => {
      cancelled = true;
    };
  }, [stats]);

  useEffect(() => {
    const i = setInterval(() => setTipIndex((t) => (t + 1) % TIPS.length), 8000);
    return () => clearInterval(i);
  }, []);

  const hasUsage =
    localStats.websites > 0 || localStats.articles > 0 || localStats.clicks > 0;

  const statCards = useMemo(
    () => [
      { label: "Websites live", value: localStats.websites, icon: Globe },
      { label: "Articles published", value: localStats.articles, icon: FileText },
      { label: "Link clicks", value: localStats.clicks, icon: MousePointerClick },
    ],
    [localStats],
  );

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="ds-h3">Your Activity</h3>

      {hasUsage ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="ds-well rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Icon size={18} />
                <span className="text-2xl font-bold text-white">{value}</span>
              </div>
              <p className="mt-1 text-sm text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-muted">
          No activity yet — start by{" "}
          <Link href="/territory" className="text-[#D4AF37] hover:text-[#45A29E]">
            picking your topic
          </Link>
          .
        </p>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
        <Lightbulb className="mt-0.5 shrink-0 text-[#D4AF37]" size={18} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]/80">Tip</p>
          <p className="mt-1 text-sm text-text-secondary">{TIPS[tipIndex]}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-muted">Individual results vary.</p>
    </div>
  );
}
