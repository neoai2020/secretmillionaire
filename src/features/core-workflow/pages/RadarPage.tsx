"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2, Check, ExternalLink, ArrowLeft, Search, Radar,
    Sparkles, ArrowRight
} from "lucide-react";
import { useSearch, Ad } from "@/features/core-workflow/context/SearchContext";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { GenerationProgress } from "@/components/ui/generation-progress";
import { useScrollToResult } from "@/hooks/useScrollToResult";

function PlatformBadge({ platform }: { platform: string }) {
    const isReddit = platform === "Reddit";
    return (
        <span className={clsx(
            "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border inline-flex items-center gap-1",
            isReddit
                ? "text-orange-400 border-orange-400/20 bg-orange-400/5"
                : "text-red-500 border-red-500/20 bg-red-500/5"
        )}>
            {platform}
        </span>
    );
}

function AdCard({
    post, isSelected, onToggle,
}: {
    post: Ad; isSelected: boolean; onToggle: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onToggle}
            className={clsx(
                "p-4 rounded-xl border transition-all cursor-pointer group relative",
                isSelected
                    ? "border-accent/40 bg-accent/5"
                    : "border-border-dim/30 bg-[#0c0c0e] hover:border-accent/20"
            )}
        >
            <div className={clsx(
                "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected ? "bg-accent border-accent text-black" : "border-border-dim bg-page group-hover:border-accent/40"
            )}>
                {isSelected && <Check size={11} strokeWidth={4} />}
            </div>

            <div className="flex flex-col gap-2.5 pr-6">
                <div className="flex items-center gap-2">
                    <PlatformBadge platform={post.platform} />
                    <span className="text-[9px] text-text-muted font-medium">
                        {typeof post.engagement === 'number'
                            ? `${post.engagement.toLocaleString()} engagements`
                            : post.engagement}
                    </span>
                </div>
                <p className="text-[13px] text-text-primary leading-relaxed font-medium line-clamp-3">
                    {post.text || post.title}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border-dim/15">
                    <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[10px] text-text-muted hover:text-accent transition-colors"
                    >
                        <ExternalLink size={10} />
                        <span>View original</span>
                    </a>
                    <span className={clsx(
                        "text-[9px] font-bold uppercase tracking-widest",
                        isSelected ? "text-accent" : "text-text-muted"
                    )}>
                        {isSelected ? "✓ Selected" : "Click to select"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export default function RadarPage() {
    const {
        variations, activeChip, setActiveChip,
        postsByVariation, setPostsByVariation,
        selectedAds, setSelectedAds
    } = useSearch();

    const [loadingChip, setLoadingChip] = useState<string | null>(null);
    const router = useRouter();
    const resultsRef = useRef<HTMLDivElement>(null);

    const currentPosts = postsByVariation[activeChip] || [];
    const isLoadingAds = loadingChip === activeChip;

    useScrollToResult(isLoadingAds, resultsRef, currentPosts.length > 0);

    const fetchPostsForChip = async (chip: string) => {
        setLoadingChip(chip);
        try {
            const resp = await fetch("/api/jackpots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword: chip.trim() })
            });
            if (resp.ok) {
                const data = await resp.json();
                setPostsByVariation({ ...postsByVariation, [chip]: data.results || [] });
            }
        } catch (e) {
            console.error("Fetch ads failed:", e);
        } finally {
            setLoadingChip(null);
        }
    };

    useEffect(() => {
        if (activeChip && (!postsByVariation[activeChip] || postsByVariation[activeChip].length === 0) && !loadingChip) {
            fetchPostsForChip(activeChip);
        }
    }, [activeChip]);

    const togglePostSelection = (post: Ad) => {
        const isAlreadySelected = selectedAds.some(p => p.id === post.id);
        if (isAlreadySelected) {
            setSelectedAds(selectedAds.filter(p => p.id !== post.id));
        } else {
            setSelectedAds([...selectedAds, post]);
        }
    };

    if (variations.length === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center border border-border-dim">
                    <Search size={24} className="text-text-muted" />
                </div>
                <div className="text-center flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-text-primary">Start with Step 1</h2>
                    <p className="text-sm text-text-muted">Enter a topic first so we can find ads for you.</p>
                </div>
                <button onClick={() => router.push("/search")} className="btn-primary">
                    <Search size={16} />
                    <span>Go to Step 1</span>
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-stack w-full"
        >
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center rounded-lg">
                        <Radar size={20} className="text-accent" />
                    </div>
                    <div>
                        <h1 className="text-2xl text-text-primary font-black tracking-tight">Step 3: Find Ads</h1>
                        <p className="text-sm text-text-muted">
                            Click ads to select them, then create replies in the next step.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end px-3 border-r border-border-dim/30">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Selected</span>
                        <span className="text-lg font-black text-accent tabular-nums">{selectedAds.length}</span>
                    </div>
                    <button
                        onClick={() => router.push("/replies")}
                        disabled={selectedAds.length === 0}
                        className={clsx(
                            "btn-primary h-10 px-5 text-sm rounded-lg group",
                            selectedAds.length === 0 && "opacity-40 grayscale pointer-events-none"
                        )}
                    >
                        <span>Step 4: Create Replies</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </header>

            {/* Keyword chips */}
            <div className="flex flex-wrap gap-2">
                {variations.map((v) => (
                    <button
                        key={v}
                        onClick={() => setActiveChip(v)}
                        className={clsx(
                            "px-3.5 py-1.5 rounded-lg border text-[12px] font-semibold transition-all",
                            activeChip === v
                                ? "bg-accent text-black border-accent"
                                : "bg-surface border-border-dim/40 text-text-muted hover:border-accent/30 hover:text-text-primary"
                        )}
                    >
                        {v}
                    </button>
                ))}
            </div>

            {isLoadingAds && (
                <GenerationProgress label={`Finding ads for “${activeChip}”…`} />
            )}

            {/* Ads grid */}
            <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scroll-mt-24">
                <AnimatePresence mode="popLayout">
                    {isLoadingAds ? null : currentPosts.length > 0 ? (
                        currentPosts.map((post) => (
                            <AdCard
                                key={post.id}
                                post={post}
                                isSelected={selectedAds.some(p => p.id === post.id)}
                                onToggle={() => togglePostSelection(post)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 border border-dashed border-border-dim/30 rounded-xl">
                            <Search size={32} className="text-text-muted/20" />
                            <p className="text-sm text-text-muted font-medium">No ads found for &ldquo;{activeChip}&rdquo;</p>
                            <p className="text-[11px] text-text-muted">Try clicking a different keyword above.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between pt-4 border-t border-border-dim/20">
                <button
                    onClick={() => router.push("/analysis")}
                    className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-accent transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Step 2</span>
                </button>
                {selectedAds.length > 0 && (
                    <p className="text-[11px] text-text-muted">
                        <strong className="text-accent">{selectedAds.length}</strong> ad{selectedAds.length !== 1 ? "s" : ""} ready for replies
                    </p>
                )}
            </div>
        </motion.div>
    );
}
