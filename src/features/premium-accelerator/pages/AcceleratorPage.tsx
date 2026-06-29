"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Rocket,
  X,
  CheckCircle2,
  Loader2,
  ClipboardPaste,
  Sparkles,
  Palette,
  Lightbulb,
} from "lucide-react";
import { saveToLinkVault } from "@/lib/save-to-link-vault";
import {
  ACCELERATOR_NICHES,
  ACCELERATOR_TEMPLATES,
  type AcceleratorTemplate,
} from "../data/templates";

const NICHE_COLORS: Record<string, string> = {
  "Health & Fitness": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Personal Finance": "text-accent bg-[#45A29E]/10 border-[#45A29E]/20",
  "Online Business": "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20",
  "Weight Loss": "text-rose-400 bg-rose-400/10 border-rose-400/20",
  "Self-Improvement": "text-purple-400 bg-purple-400/10 border-purple-400/20",
};
const DEFAULT_NC = "text-text-muted bg-white/5 border-white/10";

function ArmPopup({
  template,
  onClose,
  onArmed,
}: {
  template: AcceleratorTemplate;
  onClose: () => void;
  onArmed: () => void;
}) {
  const [promoLink, setPromoLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArm = async () => {
    if (!promoLink.trim()) return;
    setSaving(true);
    setError(null);
    const ok = await saveToLinkVault(template.name, promoLink.trim());
    setSaving(false);
    if (ok) {
      onArmed();
      onClose();
    } else {
      setError("Could not save to your Link Vault. Make sure the link starts with https://.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass-card p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-text-heading hover:bg-white/10 transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          <div>
            <h2 className="brand-font text-xl text-text-heading mb-1">Arm: {template.name}</h2>
            <p className="text-sm text-text-muted">Paste an affiliate link for a matching offer. It saves to your Link Vault, ready to deploy.</p>
          </div>

          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Recommended offers</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {template.recommendedProducts.map((p, i) => (
                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-text-muted">{p}</span>
              ))}
            </div>
          </div>

          <div className="relative">
            <ClipboardPaste className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={promoLink}
              onChange={(e) => { setPromoLink(e.target.value); if (error) setError(null); }}
              placeholder="https://www.digistore24.com/redir/..."
              className="input-base w-full pl-10"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <button onClick={handleArm} disabled={!promoLink.trim() || saving} className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Rocket className="w-4 h-4" /> Save to Link Vault</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AcceleratorPage() {
  const [selectedNiche, setSelectedNiche] = useState<string>(ACCELERATOR_NICHES[0]);
  const [armPopup, setArmPopup] = useState<AcceleratorTemplate | null>(null);
  const [armedIds, setArmedIds] = useState<Set<number>>(new Set());

  const filtered = ACCELERATOR_TEMPLATES.filter((t) => t.niche === selectedNiche);

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-5xl mx-auto w-full">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 lg:p-12 text-center border border-[#D4AF37]/15">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
          <Sparkles className="w-3.5 h-3.5" /> Society Access
        </div>
        <h1 className="brand-font text-3xl md:text-4xl text-text-heading tracking-tight mb-3">Accelerator</h1>
        <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Done-for-you campaign blueprints across five proven niches — each with a built-in angle and offer
          strategy. Pick one, arm a matching affiliate link, and deploy it as a money site.
        </p>
      </motion.div>

      {/* Niche tabs */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-3">Select a niche</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {ACCELERATOR_NICHES.map((niche) => {
            const isActive = selectedNiche === niche;
            const count = ACCELERATOR_TEMPLATES.filter((t) => t.niche === niche).length;
            return (
              <button
                key={niche}
                onClick={() => setSelectedNiche(niche)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border transition-all text-center",
                  isActive ? "bg-accent/10 border-accent/30 text-accent" : "bg-white/[0.02] border-white/5 text-text-muted hover:bg-white/5 hover:text-text-secondary"
                )}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide leading-tight">{niche}</span>
                <span className="text-[10px] opacity-70">{count} blueprints</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((template, index) => {
          const nc = NICHE_COLORS[template.niche] || DEFAULT_NC;
          const isArmed = armedIds.has(template.id);
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="glass-card p-5 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", nc)}>{template.niche}</span>
                {isArmed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/20 text-[10px] font-bold text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Armed
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">{template.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <span className="text-xs text-text-muted font-medium">{template.angle}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">{template.description}</p>

              <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Recommended for</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {template.recommendedProducts.map((p, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-text-muted">{p}</span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setArmPopup(template)}
                disabled={isArmed}
                className={clsx(
                  "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  isArmed ? "bg-green-400/10 border border-green-400/30 text-green-400 cursor-default" : "btn-primary"
                )}
              >
                {isArmed ? <><CheckCircle2 className="w-3.5 h-3.5" /> Armed</> : <><Rocket className="w-3.5 h-3.5" /> Arm Blueprint</>}
              </button>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {armPopup && (
          <ArmPopup
            template={armPopup}
            onClose={() => setArmPopup(null)}
            onArmed={() => setArmedIds((prev) => new Set(prev).add(armPopup.id))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
