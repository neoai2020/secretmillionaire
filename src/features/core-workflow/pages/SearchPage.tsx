"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, History, Loader2, Zap } from "lucide-react";
import { useSearch } from "@/features/core-workflow/context/SearchContext";
import { motion } from "framer-motion";
import { SuccessCelebration } from "@/features/dopamine/components/SuccessCelebration";

export default function SearchPage() {
    const {
        keyword, setKeyword,
        setVariations, setPostsByVariation, setActivityByVariation, setActiveChip,
        history, addToHistory
    } = useSearch();
    const [loading, setLoading] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [foundCount, setFoundCount] = useState(0);
    const router = useRouter();

    const handleSearch = async (val?: string) => {
        const searchVal = val || keyword;
        if (!searchVal) return;

        setLoading(true);
        addToHistory(searchVal);

        try {
            const resp = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword: searchVal })
            });
            const data = await resp.json();

            if (!resp.ok) {
                alert(data.error || "Search failed. Please try again.");
                return;
            }

            setVariations(data.variations || []);
            setActiveChip(data.variations?.[0] || "");
            setFoundCount(data.variations?.length || 0);
            setShowCelebration(true);
        } catch (e) {
            console.error(e);
            alert("A network error occurred. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[70vh] gap-10 max-w-xl mx-auto w-full"
        >
            <SuccessCelebration
                show={showCelebration}
                title={`Found ${foundCount} Ad Angles!`}
                subtitle="Great start. Let's check which ones have the most demand."
                onDone={() => { setShowCelebration(false); router.push("/analysis"); }}
            />

            {/* Header */}
            <div className="text-center flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/5 rounded-full border border-accent/15">
                    <Zap size={12} className="text-accent" />
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Step 1 of 4</span>
                </div>
                <h1 className="text-3xl text-text-primary font-black tracking-tight">
                    Enter Your Ad Topic
                </h1>
                <p className="text-sm text-text-muted max-w-md">
                    Type one topic below. We will find related ads and conversations from Reddit and YouTube.
                </p>
            </div>

            {/* Search Input */}
            <div className="w-full flex flex-col gap-3">
                <div className="relative group">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
                    <input
                        type="text"
                        placeholder='e.g. "weight loss", "dog food", "acne"'
                        className="input-base w-full pl-12 pr-5 h-14 text-base rounded-xl border-2 border-border-dim focus:border-accent/60"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        autoFocus
                    />
                </div>

                <button
                    onClick={() => handleSearch()}
                    disabled={loading || !keyword}
                    className="btn-primary w-full h-14 text-base rounded-xl shadow-gold font-bold tracking-wide"
                >
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="animate-spin" size={20} />
                            <span>Finding Ads...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Search size={20} />
                            <span>Find Ads</span>
                            <ArrowRight size={18} />
                        </div>
                    )}
                </button>
            </div>

            {/* Recent Searches */}
            {history.length > 0 && (
                <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                        <History size={14} className="text-text-muted" />
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Recent</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {history.map((h, i) => (
                            <button
                                key={i}
                                onClick={() => { setKeyword(h); handleSearch(h); }}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-dim rounded-lg hover:border-accent/30 transition-all group text-sm disabled:opacity-50"
                            >
                                <span className="text-text-secondary group-hover:text-text-primary font-medium">{h}</span>
                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-accent transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* How it works — inline help */}
            <div className="w-full border-t border-border-dim/30 pt-6">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">How it works</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                        { step: "1", text: "Type a topic" },
                        { step: "2", text: "We find ads" },
                        { step: "3", text: "You copy & earn" },
                    ].map((s) => (
                        <div key={s.step} className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-black text-accent">{s.step}</span>
                            </div>
                            <span className="text-[11px] text-text-secondary font-medium">{s.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
