"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  onboardingContent,
  ONBOARDING_META_KEY,
  ONBOARDING_PRODUCT_NAME,
} from "@/config/onboarding-content";
import { resolveOnboardingGate } from "@/lib/onboarding-gate";

export function OnboardingFlow() {
  const router = useRouter();
  const cfg = onboardingContent.activation;

  const [firstName, setFirstName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activationStep, setActivationStep] = useState(0);

  const verifyNotCompleted = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    const gate = await resolveOnboardingGate(supabase, user.id, user.user_metadata);
    if (gate.isComplete) {
      router.replace(onboardingContent.dashboardRoute);
    }
  }, [router]);

  useEffect(() => {
    void verifyNotCompleted();
  }, [verifyNotCompleted]);

  useEffect(() => {
    const timers = cfg.infoSteps.map((_, i) =>
      window.setTimeout(() => setActivationStep(i + 1), 600 * (i + 1))
    );
    return () => timers.forEach(window.clearTimeout);
  }, [cfg.infoSteps]);

  const handleActivate = async () => {
    const trimmed = firstName.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        await supabase
          .from("users")
          .update({ onboarding_completed_at: new Date().toISOString() })
          .eq("id", user.id);
      } catch {
        // swallow — auth metadata is the fallback
      }

      try {
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            [ONBOARDING_META_KEY]: true,
            first_name: trimmed,
            full_name: trimmed,
          },
        });
      } catch {
        // swallow
      }

      router.push(onboardingContent.dashboardRoute);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white p-8 lg:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt={ONBOARDING_PRODUCT_NAME}
            width={44}
            height={44}
            className="rounded-xl"
          />
          <div>
            <p className="text-lg font-black text-slate-900">{ONBOARDING_PRODUCT_NAME}</p>
            <p className="text-sm text-slate-500">{onboardingContent.productTagline}</p>
          </div>
        </div>

        <ul className="mt-10 space-y-3">
          {cfg.sidebarStatus.map((item, i) => (
            <li
              key={item.label}
              className={`rounded-xl border p-4 transition-all duration-500 ${
                activationStep > i
                  ? "translate-x-0 border-teal-200 bg-teal-50 opacity-100"
                  : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className="text-sm font-bold text-teal-700">{item.status}</p>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-12 sm:px-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/logo.png"
              alt={ONBOARDING_PRODUCT_NAME}
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <p className="text-base font-black text-slate-900">{ONBOARDING_PRODUCT_NAME}</p>
              <p className="text-xs text-slate-500">{onboardingContent.productTagline}</p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">{cfg.headline}</h1>
          <p className="mt-3 text-lg text-slate-600">{cfg.subheadline}</p>

          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={cfg.inputPlaceholder}
            autoComplete="given-name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && firstName.trim() && !submitting) {
                void handleActivate();
              }
            }}
            className="mt-8 h-16 w-full rounded-2xl border-2 border-slate-200 bg-white px-5 text-xl text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#45A29E] focus:ring-4 focus:ring-[#45A29E]/15"
          />

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-bold text-slate-900">{cfg.infoTitle}</p>
            <ol className="space-y-3">
              {cfg.infoSteps.map((step, i) => (
                <li
                  key={step}
                  className={`flex items-start gap-3 text-sm transition-all duration-500 ${
                    activationStep > i ? "text-slate-700 opacity-100" : "text-slate-300 opacity-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      activationStep > i ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {activationStep > i ? "✓" : i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-5 text-sm font-medium text-amber-700">{cfg.note}</p>

          <button
            type="button"
            onClick={() => void handleActivate()}
            disabled={!firstName.trim() || submitting}
            className="mt-8 h-16 w-full rounded-2xl bg-gradient-to-r from-[#45A29E] to-[#D4AF37] text-xl font-extrabold text-white shadow-lg shadow-teal-200 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {submitting ? "Activating…" : cfg.ctaLabel}
          </button>
        </div>
      </main>
    </div>
  );
}

export default OnboardingFlow;
