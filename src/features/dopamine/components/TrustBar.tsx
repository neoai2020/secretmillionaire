"use client";

import { ShieldCheck, Star, Users, DollarSign, Clock } from "lucide-react";

export function TrustBar() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-4 bg-[#0A0A0B] border border-border-dim/30 rounded-xl">
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <ShieldCheck size={11} className="text-green-400" />
                <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <Star size={11} className="text-accent fill-accent" />
                <span>4.9/5 Rating (2,400+ reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <Users size={11} className="text-blue-400" />
                <span>10,000+ Active Members</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <DollarSign size={11} className="text-green-400" />
                <span>$2.4M+ Earned by Community</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <Clock size={11} className="text-purple-400" />
                <span>24/7 Live Support</span>
            </div>
        </div>
    );
}
