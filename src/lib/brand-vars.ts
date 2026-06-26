import { brand } from "@/config/brand.config";

export function getBrandCssVars(): Record<string, string> {
  return {
    "--bg-page": brand.colors.page,
    "--bg-sidebar": brand.colors.sidebar,
    "--bg-panel": brand.colors.panel,
    "--brand-primary": brand.colors.primary,
    "--brand-secondary": brand.colors.secondary,
    "--brand-tint": "rgba(69, 162, 158, 0.1)",
    "--promo-accent": brand.colors.promoAccent,
    "--promo-cta": brand.colors.promoCta,
    "--text-primary": brand.colors.textPrimary,
  };
}

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
