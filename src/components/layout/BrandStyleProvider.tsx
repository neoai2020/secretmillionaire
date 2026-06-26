"use client";

import { getBrandCssVars } from "@/lib/brand-vars";

export function BrandStyleProvider({ children }: { children: React.ReactNode }) {
  const vars = getBrandCssVars();
  return <div style={vars as React.CSSProperties}>{children}</div>;
}
