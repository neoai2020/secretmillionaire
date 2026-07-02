"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { brand } from "@/config/brand.config";
import { BrandLogo } from "@/components/layout/BrandLogo";
import {
  onboardingContent,
  ONBOARDING_BETA_QUALIFICATION_CTA_URL,
  ONBOARDING_DASHBOARD_ROUTE,
  ONBOARDING_META_KEY,
} from "@/config/onboarding-content";

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
    <section className="flex flex-col min-h-0 flex-1 justify-start w-full max-w-2xl mx-auto gap-4 px-1 sm:px-0">
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

function WelcomeCompleteStep({
  onClaimOffer,
  onSkip,
  busy,
}: {
  onClaimOffer: () => void;
  onSkip: () => void;
  busy: boolean;
}) {
  const { welcome, partnerOffer } = onboardingContent;
  const showPartnerCta = partnerOffer.enabled;
  const primaryCta = showPartnerCta
    ? partnerOffer.qualification.primaryCta
    : welcome.continueCta;
  const skipCta = showPartnerCta ? partnerOffer.qualification.noThanksCta : null;

  return (
    <section className="flex flex-col min-h-0 flex-1 justify-start w-full max-w-2xl mx-auto gap-6 text-center">
      <div
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(69, 162, 158, 0.15)" }}
      >
        <CheckCircle2 size={32} style={{ color: brand.colors.encryptedGreen }} />
      </div>
      <h1 className="text-3xl font-extrabold text-white">{welcome.title}</h1>
      <p className="text-slate-400 leading-relaxed">{welcome.body}</p>
      <button type="button" disabled={busy} onClick={onClaimOffer} className="btn-primary w-full">
        {busy ? "Saving..." : primaryCta}
      </button>
      {skipCta && (
        <button
          type="button"
          disabled={busy}
          onClick={onSkip}
          className="text-sm text-slate-400 underline hover:text-slate-300 transition-colors"
        >
          {skipCta}
        </button>
      )}
    </section>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [busy, setBusy] = useState(false);

  const goToDashboard = () => {
    router.replace(ONBOARDING_DASHBOARD_ROUTE);
  };

  const finishOnboarding = async () => {
    if (busy) return;
    setBusy(true);
    await persistCompletion();
    setBusy(false);
    goToDashboard();
  };

  const handleClaimOffer = async () => {
    if (busy) return;
    setBusy(true);
    await persistCompletion();
    if (ONBOARDING_BETA_QUALIFICATION_CTA_URL) {
      window.open(ONBOARDING_BETA_QUALIFICATION_CTA_URL, "_blank", "noopener,noreferrer");
    }
    goToDashboard();
  };

  return (
    <div className="fixed inset-0 z-[300] h-[100dvh] max-h-[100dvh] overflow-y-auto" style={{ backgroundColor: PAGE_BG }}>
      <div className="relative z-10 flex flex-col min-h-[100dvh] px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 safe-top safe-bottom">
        <header className="flex flex-col items-center gap-2 shrink-0 mb-4 sm:mb-5">
          <BrandLogo size="md" showTagline={false} />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            {brand.memberLabel} Onboarding
          </span>
        </header>

        <div className="flex flex-col min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col min-h-0 flex-1"
            >
              {step === 0 && <PreparingStep onContinue={() => setStep(1)} />}
              {step === 1 && (
                <WelcomeCompleteStep
                  onClaimOffer={handleClaimOffer}
                  onSkip={finishOnboarding}
                  busy={busy}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;
