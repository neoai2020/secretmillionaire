"use client";

import { Circle } from "lucide-react";
import {
  AWAITING_STATUS_LABEL,
  SECURED_STATUS_LABEL,
  useSecuredConnection,
} from "@/features/extraction-workflow/hooks/useSecuredConnection";

export function ConnectionStatus() {
  const secured = useSecuredConnection();

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-full border border-[#45A29E]/30 bg-[#45A29E]/5 text-[10px] sm:text-[11px] font-medium text-[#C5C6C7] max-w-full">
      <Circle
        size={8}
        className={`shrink-0 ${secured ? "text-[#45A29E] fill-[#45A29E] animate-pulse" : "text-[#6b7280] fill-[#6b7280]"}`}
      />
      <span className="text-center sm:text-left leading-snug">
        Server Status:{" "}
        <span className={secured ? "text-[#45A29E]" : "text-[#6b7280]"}>
          {secured ? SECURED_STATUS_LABEL : AWAITING_STATUS_LABEL}
        </span>
      </span>
    </div>
  );
}
