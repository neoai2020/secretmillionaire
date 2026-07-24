"use client";

import { useEffect, useState } from "react";
import { Headphones, X } from "lucide-react";
import { ContactSupportWidget } from "@/components/dashboard/ContactSupportWidget";

export function FloatingSupportButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Contact support"
          className="fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-[#45A29E]/30 bg-[#0B0C10]/95 shadow-2xl shadow-black/60 backdrop-blur-xl sm:bottom-24 sm:right-6"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#1e2128] px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#45A29E]/25 bg-[#45A29E]/10">
                <Headphones className="text-[#45A29E]" size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#E2E8F0]">Contact Support</p>
                <p className="truncate text-xs text-[#9fb0b5]">We usually reply within ~2 hours</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support panel"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9fb0b5] transition-colors hover:bg-white/5 hover:text-[#E2E8F0]"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[min(70vh,34rem)] overflow-y-auto p-5">
            <ContactSupportWidget embedded />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-50 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#45A29E] px-4 py-2.5 text-sm font-bold text-[#070D0D] shadow-lg shadow-black/40 transition hover:brightness-110 active:scale-[0.98] sm:bottom-6 sm:right-6"
      >
        {open ? <X size={18} /> : <Headphones size={18} />}
        <span>{open ? "Close" : "Need help?"}</span>
      </button>
    </>
  );
}
