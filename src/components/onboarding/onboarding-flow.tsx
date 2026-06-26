"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, Smartphone, Globe, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { brand } from "@/config/brand.config";
import { BrandLogo } from "@/components/layout/BrandLogo";
import {
  onboardingContent,
  ONBOARDING_BETA_QUALIFICATION_CTA_URL,
  ONBOARDING_DASHBOARD_ROUTE,
  ONBOARDING_META_KEY,
} from "@/config/onboarding-content";
import { PromoSlotRenderer } from "@/components/layout/PromoSlotRenderer";
import { getPromoSlot } from "@/config/promos.config";

const PAGE_BG = brand.colors.page;

interface PreparingRow {
  label: string;
  description: string;
  completed: boolean;
}

async function persistCompletion(): Promise<void> {
  let userId: string | null = null;
  let existingMeta: Record<string, unknown> = {};

  try {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
    existingMeta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
  } catch {
    // ignore
  }

  if (userId) {
    try {
      await supabase
        .from("users")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", userId);
    } catch {
      // ignore
    }
  }

  try {
    await supabase.auth.updateUser({
      data: { ...existingMeta, [ONBOARDING_META_KEY]: true },
    });
  } catch {
    // ignore
  }
}

function PreparingStep({ onContinue }: { onContinue: () => void }) {
  const [rows, setRows] = useState<PreparingRow[]>(
    onboardingContent.preparing.rows.map((r) => ({ ...r, completed: false }))
  );
  const generationRef = useRef(0);

  useEffect(() => {
    generationRef.current += 1;
    const myGen = generationRef.current;
    const delays = [400, 500, 600];
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    onboardingContent.preparing.rows.forEach((_, idx) => {
      cumulative += delays[Math.min(idx, delays.length - 1)];
      const t = setTimeout(() => {
        if (generationRef.current !== myGen) return;
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, completed: true } : r)));
      }, cumulative);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const allDone = rows.every((r) => r.completed);

  return (
    <section className="flex flex-col min-h-0 flex-1 justify-center w-full max-w-2xl mx-auto gap-4 px-1 sm:px-0">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white text-center">
        {onboardingContent.preparing.title}
      </h1>
      <div className="flex flex-col gap-3">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                row.completed
                  ? "bg-[#45A29E]/20 text-[#45A29E]"
                  : "bg-[#D4AF37]/10 text-[#D4AF37]"
              }`}
            >
              {row.completed ? <Check size={18} /> : <Loader2 size={18} className="animate-spin" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{row.label}</p>
              <p className="text-xs text-slate-400">{row.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p
        className="text-xs rounded-xl p-3 border"
        style={{
          color: brand.colors.platinumSilver,
          backgroundColor: "rgba(212, 175, 55, 0.08)",
          borderColor: "rgba(212, 175, 55, 0.25)",
        }}
      >
        <strong style={{ color: brand.colors.vaultGold }}>Tip:</strong> {onboardingContent.preparing.tip}
      </p>
      <button
        type="button"
        disabled={!allDone}
        onClick={onContinue}
        className="btn-primary w-full disabled:opacity-50"
      >
        {onboardingContent.preparing.continueCta}
      </button>
    </section>
  );
}

function WelcomeCompleteStep({ onContinue, busy }: { onContinue: () => void; busy: boolean }) {
  return (
    <section className="flex flex-col min-h-0 flex-1 justify-center w-full max-w-2xl mx-auto gap-6 text-center">
      <div
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(69, 162, 158, 0.15)" }}
      >
        <CheckCircle2 size={32} style={{ color: brand.colors.encryptedGreen }} />
      </div>
      <h1 className="text-3xl font-extrabold text-white">{onboardingContent.welcome.title}</h1>
      <p className="text-slate-400 leading-relaxed">{onboardingContent.welcome.body}</p>
      <button type="button" disabled={busy} onClick={onContinue} className="btn-primary w-full">
        {busy ? "Saving..." : onboardingContent.welcome.continueCta}
      </button>
    </section>
  );
}

function PartnerOfferModal({
  onClaim,
  onSkip,
  busy,
}: {
  onClaim: () => void;
  onSkip: () => void;
  busy: boolean;
}) {
  const { partnerOffer } = onboardingContent;
  const reqIcons = [Smartphone, Globe, CheckCircle2];
  const promoSlot = useMemo(
    () =>
      getPromoSlot("onboarding-claim") ?? {
        id: "onboarding-claim",
        enabled: true,
        template: "modal" as const,
        placement: "modal" as const,
        content: {
          badge: partnerOffer.qualification.badge,
          headline: partnerOffer.qualification.headline,
          bullets: [...partnerOffer.qualification.requirements],
          ctaLabel: partnerOffer.qualification.primaryCta,
          ctaUrl: ONBOARDING_BETA_QUALIFICATION_CTA_URL,
        },
      },
    [partnerOffer]
  );

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85">
      <div className="max-w-lg w-full max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#111] p-5 sm:p-8 shadow-2xl safe-bottom">
        <span className="text-xs font-black text-accent uppercase tracking-widest">
          {partnerOffer.badge}
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">{partnerOffer.headline}</h2>
        <p className="text-sm text-slate-400 mt-2">{partnerOffer.subcopy}</p>
        <div className="mt-6 space-y-3">
          {partnerOffer.qualification.requirements.map((req, idx) => {
            const Icon = reqIcons[idx] ?? CheckCircle2;
            return (
              <div key={req} className="flex items-center gap-3 text-sm text-white">
                <Icon size={16} style={{ color: brand.colors.encryptedGreen }} />
                {req}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onClaim}
          className="btn-primary w-full mt-6"
        >
          {partnerOffer.qualification.primaryCta}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onSkip}
          className="w-full mt-3 text-sm text-slate-400 underline"
        >
          {partnerOffer.qualification.noThanksCta}
        </button>
        <p className="text-[10px] text-slate-500 mt-4 text-center">
          {partnerOffer.qualification.finePrint}
        </p>
      </div>
      {/* PromoSlotRenderer available for custom onboarding-claim slot from promos.config */}
      <div className="hidden">
        <PromoSlotRenderer slot={promoSlot} />
      </div>
    </div>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [busy, setBusy] = useState(false);
  const [showPartnerOffer, setShowPartnerOffer] = useState(false);

  const goToDashboard = () => {
    router.replace(ONBOARDING_DASHBOARD_ROUTE);
  };

  const finishOnboarding = async () => {
    if (busy) return;
    setBusy(true);
    await persistCompletion();
    if (onboardingContent.partnerOffer.enabled) {
      setShowPartnerOffer(true);
      setBusy(false);
      return;
    }
    goToDashboard();
  };

  const handlePartnerClaim = async () => {
    if (busy) return;
    setBusy(true);
    if (ONBOARDING_BETA_QUALIFICATION_CTA_URL) {
      window.open(ONBOARDING_BETA_QUALIFICATION_CTA_URL, "_blank", "noopener,noreferrer");
    }
    goToDashboard();
  };

  return (
    <div className="fixed inset-0 z-[300] h-[100dvh] max-h-[100dvh] overflow-y-auto" style={{ backgroundColor: PAGE_BG }}>
      <div className="relative z-10 flex flex-col min-h-[100dvh] px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-7 safe-top safe-bottom">
        <header className="flex flex-col items-center gap-3 shrink-0">
          <BrandLogo size="md" showTagline={false} />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            {brand.memberLabel} Onboarding
          </span>
        </header>

        <div className="flex flex-col min-h-0 flex-1 mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col min-h-0 flex-1"
            >
              {step === 0 && <PreparingStep onContinue={() => setStep(1)} />}
              {step === 1 && <WelcomeCompleteStep onContinue={finishOnboarding} busy={busy} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showPartnerOffer && (
        <PartnerOfferModal
          onClaim={handlePartnerClaim}
          onSkip={goToDashboard}
          busy={busy}
        />
      )}
    </div>
  );
}

export default OnboardingFlow;
