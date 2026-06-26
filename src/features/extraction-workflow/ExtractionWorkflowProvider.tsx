"use client";

import { usePathname } from "next/navigation";
import { isFeatureEnabled } from "@/config/features.config";
import { WorkflowNavProvider } from "@/context/WorkflowNavContext";
import { ExtractionProvider, useExtraction } from "./context/ExtractionContext";

function ExtractionNavBridge({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { step, connected, scanned, resetSession } = useExtraction();

  let progress = 0;
  if (step >= 3 || pathname === "/extraction") progress = 3;
  else if (step >= 2 || scanned) progress = 2;
  else if (step >= 1 || connected) progress = 1;

  return (
    <WorkflowNavProvider value={{ progress, resetSession }}>{children}</WorkflowNavProvider>
  );
}

export function ExtractionWorkflowProvider({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("extraction-workflow")) {
    return <>{children}</>;
  }

  return (
    <ExtractionProvider>
      <ExtractionNavBridge>{children}</ExtractionNavBridge>
    </ExtractionProvider>
  );
}
