"use client";

import { Circle, ShieldCheck } from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import {
  AWAITING_STATUS_LABEL,
  SECURED_STATUS_LABEL,
  useSecuredConnection,
} from "@/features/extraction-workflow/hooks/useSecuredConnection";

/** Honest connection status only — no fake member counts or earnings toasts. */
export function SidebarStatusPanel() {
  const showExtraction = isFeatureEnabled("extraction-workflow");
  const secured = useSecuredConnection();

  if (!showExtraction) return null;

  const green = brand.colors.encryptedGreen;
  const gold = brand.colors.vaultGold;

  return (
    <div
      className="relative mx-1 rounded-2xl glass-surface p-3.5 flex flex-col gap-3"
      style={{ boxShadow: `var(--shadow-glass), 0 0 0 1px ${green}0D` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-[14px] opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${gold}66, ${green}66, transparent)` }}
        aria-hidden
      />

      <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-tile">
        <ShieldCheck
          size={12}
          className="shrink-0"
          style={{ color: secured ? green : brand.colors.textMuted }}
        />
        <span className="text-[10px] font-medium text-text-primary leading-snug">
          Server:{" "}
          <span style={{ color: secured ? green : brand.colors.textMuted }}>
            {secured ? SECURED_STATUS_LABEL : AWAITING_STATUS_LABEL}
          </span>
        </span>
        <Circle
          size={5}
          className={`ml-auto shrink-0 ${secured ? "animate-pulse" : ""}`}
          style={{
            color: secured ? green : brand.colors.textMuted,
            fill: secured ? green : brand.colors.textMuted,
          }}
        />
      </div>
    </div>
  );
}
