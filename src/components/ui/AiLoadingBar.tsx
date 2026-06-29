"use client";

interface AiLoadingBarProps {
  label?: string;
  className?: string;
  /** 0–100 for determinate progress; omit for indeterminate sweep */
  progress?: number;
  /** Pulse + sweep while work is in progress (even if % is unchanged). */
  active?: boolean;
}

export function AiLoadingBar({ label, className = "", progress, active = false }: AiLoadingBarProps) {
  const determinate = typeof progress === "number";
  const clamped = determinate ? Math.min(100, Math.max(0, progress)) : 0;
  const showActivity = active || !determinate;

  return (
    <div className={`flex flex-col gap-2 ${className}`} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        {label && (
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#45A29E]/90 flex items-center gap-2 min-w-0">
            {showActivity && (
              <span
                className="inline-block w-1.5 h-1.5 shrink-0 rounded-full bg-[#45A29E] ai-loading-pulse-dot"
                aria-hidden
              />
            )}
            <span className="truncate">{label}</span>
          </p>
        )}
        {determinate && (
          <p className="text-[10px] font-bold tabular-nums text-[#D4AF37]/90 shrink-0">
            {clamped}%
          </p>
        )}
      </div>
      <div className="ai-loading-track relative h-1.5 w-full overflow-hidden rounded-full">
        {determinate ? (
          <div
            className={`ai-loading-fill absolute inset-y-0 left-0 rounded-full${showActivity ? " ai-loading-fill--active" : ""}`}
            style={{ width: `${clamped}%` }}
          />
        ) : null}
        {showActivity && (
          <div
            className={`ai-loading-beam absolute inset-y-0 rounded-full${determinate ? " ai-loading-beam--overlay" : ""}`}
          />
        )}
      </div>
    </div>
  );
}
