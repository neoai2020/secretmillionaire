import { brand } from "@/config/brand.config";

export function getBrandCssVars(): Record<string, string> {
  return {
    "--bg-page": brand.colors.page,
    "--bg-sidebar": brand.colors.sidebar,
    "--bg-panel": brand.colors.panel,
    "--bg-panel-glass": brand.colors.panelGlass,
    "--bg-border": "rgba(255, 255, 255, 0.08)",
    "--bg-border-glow": brand.colors.borderGlow,
    "--bg-border-teal": brand.colors.borderTeal,
    "--bg-glass": "rgba(12, 28, 28, 0.65)",
    "--brand-primary": brand.colors.primary,
    "--brand-secondary": brand.colors.secondary,
    "--brand-tint": "rgba(69, 162, 158, 0.12)",
    "--promo-accent": brand.colors.promoAccent,
    "--promo-cta": brand.colors.promoCta,
    "--text-heading": brand.colors.textHeading,
    "--text-primary": brand.colors.textPrimary,
    "--text-muted-custom": brand.colors.textMuted,
    "--shadow-glass":
      "0 0 0 1px rgba(79, 209, 197, 0.05) inset, 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 48px rgba(69, 162, 158, 0.08)",
    "--glow-teal": "0 0 48px rgba(69, 162, 158, 0.12)",
    "--glow-gold": "0 0 32px rgba(212, 175, 55, 0.15)",
  };
}

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
