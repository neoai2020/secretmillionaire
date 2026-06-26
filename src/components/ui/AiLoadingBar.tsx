"use client";

interface AiLoadingBarProps {
  label?: string;
  className?: string;
}

export function AiLoadingBar({ label, className = "" }: AiLoadingBarProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} role="status" aria-live="polite">
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#45A29E]/90">
          {label}
        </p>
      )}
      <div className="ai-loading-track relative h-1 w-full overflow-hidden rounded-full">
        <div className="ai-loading-beam absolute inset-y-0 w-[42%] rounded-full" />
      </div>
    </div>
  );
}
