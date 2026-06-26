"use client";

import { isFeatureEnabled } from "@/config/features.config";
import { BlogBuilderProvider } from "./context/BlogBuilderContext";

export function BlogBuilderWorkflowProvider({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("blog-builder")) {
    return <>{children}</>;
  }

  return <BlogBuilderProvider>{children}</BlogBuilderProvider>;
}

export { useBlogBuilder } from "./context/BlogBuilderContext";
