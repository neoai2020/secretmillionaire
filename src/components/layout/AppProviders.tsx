"use client";

import { isFeatureEnabled } from "@/config/features.config";
import { CoreWorkflowProvider } from "@/features/core-workflow/CoreWorkflowProvider";
import { ExtractionWorkflowProvider } from "@/features/extraction-workflow/ExtractionWorkflowProvider";
import { BlogBuilderWorkflowProvider } from "@/features/blog-builder/BlogBuilderWorkflowProvider";
import { BrandStyleProvider } from "./BrandStyleProvider";
import { Shell } from "./Shell";

export function AppProviders({ children }: { children: React.ReactNode }) {
  let content = (
    <BrandStyleProvider>
      <Shell>{children}</Shell>
    </BrandStyleProvider>
  );

  if (isFeatureEnabled("blog-builder")) {
    content = <BlogBuilderWorkflowProvider>{content}</BlogBuilderWorkflowProvider>;
  }

  if (isFeatureEnabled("extraction-workflow")) {
    content = <ExtractionWorkflowProvider>{content}</ExtractionWorkflowProvider>;
  }

  if (isFeatureEnabled("core-workflow")) {
    content = <CoreWorkflowProvider>{content}</CoreWorkflowProvider>;
  }

  return content;
}
