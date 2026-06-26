"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Target, Zap, Crown } from "lucide-react";

interface MilestoneTrackerProps {
    totalSearches: number;
    nichesAnalyzed: number;
}

const MILESTONES = [
    { threshold: 1, label: "First Search", icon: Target, reward: "You started. Most people never do." },
    { threshold: 5, label: "Getting Serious", icon: Flame, reward: "You're ahead of 80% of members." },
    { threshold: 10, label: "Ad Hunter", icon: Zap, reward: "Top 10% of earners started here." },
    { threshold: 25, label: "Power User", icon: Trophy, reward: "You're in the top 5%. Keep going!" },
    { threshold: 50, label: "CashTap Master", icon: Crown, reward: "Elite status. You're unstoppable." },
];

export function MilestoneTracker({ totalSearches }: MilestoneTrackerProps) {
    const currentMilestone = MILESTONES.filter(m => totalSearches >= m.threshold).pop();
    const nextMilestone = MILESTONES.find(m => totalSearches < m.threshold);
    const progressToNext = nextMilestone
        ? Math.min(100, (totalSearches / nextMilestone.threshold) * 100)
        : 100;

    return (
        <div className="card-base border-accent/10 flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                        <Trophy size={18} className="text-accent" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">Your Progress</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-widest">
                            {currentMilestone ? currentMilestone.label : "Just Getting Started"}
                        </span>
                    </div>
                </div>
                {currentMilestone && (
                    <div className="bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <currentMilestone.icon size={12} className="text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase">{currentMilestone.label}</span>
                    </div>
                )}
            </div>

            {currentMilestone && (
                <p className="text-xs text-green-400 font-medium bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2">
                    {currentMilestone.reward}
                </p>
            )}

            {nextMilestone && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-text-muted font-bold uppercase tracking-widest">
                            Next: {nextMilestone.label}
                        </span>
                        <span className="text-accent font-black">{totalSearches}/{nextMilestone.threshold}</span>
                    </div>
                    <div className="w-full h-2.5 bg-page rounded-full overflow-hidden border border-border-dim/30">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressToNext}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-accent rounded-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
