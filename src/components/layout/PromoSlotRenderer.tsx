"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  Sparkles,
  Headphones,
  X,
  type LucideIcon,
} from "lucide-react";
import type { PromoSlot } from "@/config/promos.config";
import { getNavIcon } from "@/lib/nav-icons";
import { brand } from "@/config/brand.config";
import { GoldCoinsIcon, GoldCoinsIconRing } from "@/components/icons/GoldCoinsIcon";

interface PromoSlotRendererProps {
  slot: PromoSlot;
  onClose?: () => void;
}

function AnimatedIconRing({
  Icon,
  size = 56,
  className = "",
}: {
  Icon: LucideIcon;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-60"
        style={{
          background: `conic-gradient(from 0deg, ${brand.colors.encryptedGreen}, ${brand.colors.vaultGold}, ${brand.colors.encryptedGreen})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="relative z-10 flex items-center justify-center rounded-2xl promo-icon-float"
        style={{
          width: size + 16,
          height: size + 16,
          background: "linear-gradient(145deg, rgba(69,162,158,0.25) 0%, rgba(11,12,16,0.9) 100%)",
          boxShadow: "0 0 30px rgba(69, 162, 158, 0.35)",
        }}
      >
        <Icon size={size * 0.55} strokeWidth={1.5} style={{ color: brand.colors.vaultGold }} />
      </div>
    </div>
  );
}

function ScarcityBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, (current / total) * 100);
  return (
    <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${brand.colors.encryptedGreen}, ${brand.colors.vaultGold})`,
          boxShadow: "0 0 12px rgba(212, 175, 55, 0.5)",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
}

export function PromoSlotRenderer({ slot, onClose }: PromoSlotRendererProps) {
  const { template, content, id } = slot;
  const Icon = content.icon ? getNavIcon(content.icon) : null;
  const bodies = Array.isArray(content.body) ? content.body : content.body ? [content.body] : [];

  if (template === "horizontal-banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full pt-2 sm:pt-4 pb-4 -mt-2 sm:-mt-4 group mb-4 sm:mb-6"
      >
        <div
          className="relative overflow-hidden rounded-2xl p-4 sm:p-6 lg:p-7 promo-shimmer"
          style={{
            background: `linear-gradient(125deg, #0d4a47 0%, ${brand.colors.promoAccent} 35%, #0B0C10 70%, #2a2410 100%)`,
            boxShadow:
              "0 8px 40px rgba(69, 162, 158, 0.25), 0 0 0 1px rgba(69, 162, 158, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="promo-glow-orb w-32 h-32 -top-10 -right-10"
            style={{ background: brand.colors.vaultGold }}
          />
          <div
            className="promo-glow-orb w-40 h-40 -bottom-16 -left-10"
            style={{ background: brand.colors.encryptedGreen, animationDelay: "1.5s" }}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10 w-full max-w-5xl">
            <div className="hidden md:block shrink-0">
              <GoldCoinsIconRing size={80} />
            </div>
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 md:hidden">
                <GoldCoinsIcon size={28} />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#45A29E]">
                  Member Offer
                </span>
              </div>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight"
                style={{
                  background: "linear-gradient(90deg, #fff 0%, #C5C6C7 60%, #D4AF37 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {content.headline}
              </h2>
              {bodies.length > 0 && (
                <div className="text-white/90 text-[15px] space-y-1.5 leading-relaxed font-medium">
                  {bodies.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
              {content.ctaLabel && content.ctaUrl && (
                <motion.div className="mt-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    type="button"
                    onClick={() => window.open(content.ctaUrl, "_blank")}
                    className="promo-cta-gold text-[#0B0C10] font-bold px-5 sm:px-7 py-3 rounded-xl text-sm sm:text-[15px] w-full sm:w-auto transition-transform"
                  >
                    {content.ctaLabel}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (template === "footer-card") {
    const FooterIcon = Icon ?? Headphones;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="promo-gradient-border flex flex-col gap-4 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl w-full mt-6 sm:mt-8 shrink-0 relative overflow-hidden"
        style={{
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(69,162,158,0.08)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${brand.colors.encryptedGreen} 0%, transparent 70%)`,
          }}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5 relative z-10">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <motion.div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 relative"
              animate={{ boxShadow: ["0 0 0 0 rgba(69,162,158,0.4)", "0 0 0 8px rgba(69,162,158,0)", "0 0 0 0 rgba(69,162,158,0.4)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                background: "linear-gradient(135deg, rgba(69,162,158,0.2), rgba(212,175,55,0.15))",
                border: "1px solid rgba(69, 162, 158, 0.4)",
              }}
            >
              <FooterIcon size={24} strokeWidth={1.5} className="text-accent" />
            </motion.div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[17px] font-bold text-white tracking-tight">
                {content.title ?? content.headline}
              </h3>
              {content.subtitle && (
                <p className="text-[#9ca3af] text-[14px]">{content.subtitle}</p>
              )}
            </div>
          </div>
          {content.ctaLabel && content.ctaUrl && (
            <motion.a
              href={content.ctaUrl}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="promo-cta-glow rounded-full h-[42px] px-6 sm:px-7 w-full sm:w-auto text-[#0B0C10] font-bold text-[14px] flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${brand.colors.encryptedGreen}, #5ec4bf)`,
              }}
            >
              {content.ctaLabel}
            </motion.a>
          )}
        </div>
        {content.stats && content.stats.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/8 relative z-10">
            {content.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <Sparkles size={10} className="text-[#D4AF37] shrink-0" />
                <span>
                  {stat.text}
                  {stat.highlight && (
                    <>
                      {" "}
                      <strong style={{ color: brand.colors.vaultGold }}>{stat.highlight}</strong>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  if (template === "sidebar-card") {
    return (
      <a
        href={content.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-between gap-3 p-3.5 rounded-xl glass-tile hover:border-accent/40 transition-all duration-200 hover:shadow-[var(--glow-teal)]"
      >
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(180deg, ${brand.colors.vaultGold}, ${brand.colors.encryptedGreen})`,
          }}
          aria-hidden
        />

        <div className="flex flex-col gap-0.5 min-w-0 pl-2">
          <span
            className="brand-font text-[13px] font-semibold leading-tight transition-colors"
            style={{ color: brand.colors.encryptedGreen }}
          >
            {content.headline}
          </span>
          <span className="text-[10px] text-text-muted font-medium group-hover:text-[#C5C6C7]/80 transition-colors">
            {content.sidebarSubtitle ?? "Claim Now"}
          </span>
        </div>

        <div className="w-8 h-8 rounded-lg border border-[#45A29E]/25 flex items-center justify-center shrink-0 group-hover:bg-[#45A29E]/10 group-hover:border-[#45A29E]/50 transition-colors">
          <ExternalLink size={14} style={{ color: brand.colors.encryptedGreen }} />
        </div>
      </a>
    );
  }

  if (template === "modal") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 24 }}
          className="relative w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl safe-bottom overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #1a2220 0%, #0f1115 50%, #0B0C10 100%)",
            boxShadow: "0 0 60px rgba(69, 162, 158, 0.2), 0 25px 50px rgba(0,0,0,0.5)",
            border: "1px solid rgba(69, 162, 158, 0.25)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${brand.colors.encryptedGreen}, ${brand.colors.vaultGold}, ${brand.colors.encryptedGreen})`,
            }}
          />
          <div
            className="promo-glow-orb w-56 h-56 -top-20 -right-20 opacity-40 z-0 pointer-events-none"
            style={{ background: brand.colors.vaultGold }}
          />

          {onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-3 right-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#0B0C10]/90 text-white shadow-lg hover:bg-white/10 hover:border-[#45A29E]/50 transition-colors"
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          )}

          <div className="relative z-10 flex justify-center mb-4">
            <AnimatedIconRing Icon={Sparkles} size={40} />
          </div>

          {content.badge && (
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                color: brand.colors.vaultGold,
                background: "rgba(212, 175, 55, 0.12)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
              }}
            >
              {content.badge}
            </motion.span>
          )}
          <h2 className="relative z-10 text-2xl font-bold text-white mt-3">{content.headline}</h2>
          {bodies[0] && <p className="relative z-10 text-text-secondary mt-2 leading-relaxed">{bodies[0]}</p>}
          {content.bullets && (
            <ul className="relative z-10 mt-4 space-y-2.5">
              {content.bullets.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="text-sm text-text-secondary flex gap-2.5 items-start"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#0B0C10]"
                    style={{ background: brand.colors.encryptedGreen }}
                  >
                    ✓
                  </span>
                  {b}
                </motion.li>
              ))}
            </ul>
          )}
          {content.scarcity && (
            <div className="relative z-10 mt-4">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>{content.scarcity.label}</span>
                <span className="font-bold" style={{ color: brand.colors.vaultGold }}>
                  {content.scarcity.current}/{content.scarcity.total}
                </span>
              </div>
              <ScarcityBar current={content.scarcity.current} total={content.scarcity.total} />
            </div>
          )}
          {content.ctaLabel && content.ctaUrl && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                window.open(content.ctaUrl, "_blank");
                onClose?.();
              }}
              className="relative z-10 promo-cta-gold w-full mt-6 py-3.5 rounded-xl font-bold text-[#0B0C10]"
            >
              {content.ctaLabel}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (template === "toast") {
    const isWithdraw = id === "toast-withdraw";
    return (
      <motion.div
        initial={{ opacity: 0, x: 40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 40, scale: 0.95 }}
        className="fixed z-[9998] w-[min(calc(100vw-2rem),22rem)] rounded-2xl p-4 overflow-hidden"
        style={{
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "max(1rem, env(safe-area-inset-bottom))",
          background: "linear-gradient(135deg, #141a18 0%, #0d1014 100%)",
          border: `1px solid ${isWithdraw ? "rgba(212, 175, 55, 0.45)" : "rgba(69, 162, 158, 0.35)"}`,
          boxShadow: isWithdraw
            ? "0 8px 32px rgba(212, 175, 55, 0.25), 0 0 24px rgba(212, 175, 55, 0.12)"
            : "0 8px 32px rgba(69, 162, 158, 0.2), 0 0 24px rgba(69, 162, 158, 0.1)",
        }}
      >
        <div className="promo-shimmer absolute inset-0 rounded-2xl opacity-30 pointer-events-none" aria-hidden />
        <div className="flex gap-3 relative z-10 pr-6">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: isWithdraw
                ? "linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.12))"
                : "linear-gradient(135deg, rgba(69,162,158,0.3), rgba(69,162,158,0.1))",
            }}
          >
            {isWithdraw ? (
              <GoldCoinsIcon size={22} />
            ) : (
              <Sparkles size={18} style={{ color: brand.colors.encryptedGreen }} />
            )}
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white leading-snug">{content.headline}</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              {content.toastMessage}{" "}
              {content.toastAmount && (
                <span className="font-bold" style={{ color: brand.colors.vaultGold }}>
                  {content.toastAmount}
                </span>
              )}
            </p>
            {content.ctaLabel && content.ctaUrl && (
              <button
                type="button"
                onClick={() => window.open(content.ctaUrl, "_blank")}
                className="text-xs font-bold mt-2 hover:underline"
                style={{ color: brand.colors.encryptedGreen }}
              >
                {content.ctaLabel} →
              </button>
            )}
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
      </motion.div>
    );
  }

  return null;
}
