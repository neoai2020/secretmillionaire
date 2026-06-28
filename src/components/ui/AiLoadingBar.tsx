"use client";

interface AiLoadingBarProps {
  label?: string;
  className?: string;
  /** 0–100 for determinate progress; omit for indeterminate sweep */
  progress?: number;
}

export function AiLoadingBar({ label, className = "", progress }: AiLoadingBarProps) {
  const determinate = typeof progress === "number";
  const clamped = determinate ? Math.min(100, Math.max(0, progress)) : 0;

  return (
    <div className={`flex flex-col gap-2 ${className}`} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        {label && (
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#45A29E]/90">
            {label}
          </p>
        )}
        {determinate && (
          <p className="text-[10px] font-bold tabular-nums text-[#D4AF37]/90">{clamped}%</p>
        )}
      </div>
      <div className="ai-loading-track relative h-1.5 w-full overflow-hidden rounded-full">
        {determinate ? (
          <div className="ai-loading-fill absolute inset-y-0 left-0 rounded-full" style={{ width: `${clamped}%` }} />
        ) : (
          <div className="ai-loading-beam absolute inset-y-0 w-[42%] rounded-full" />
        )}
      </div>
    </div>
  );
}
