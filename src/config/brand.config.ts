export const brand = {
  productName: "Secret Millionaire Society",
  tagline: "Affiliate Websites Made Simple",
  authTagline: "Member Sign In",
  signupTagline: "Join the Society",
  memberLabel: "Member",
  logo: {
    type: "image" as const,
    src: "/logo.png",
    alt: "Secret Millionaire Society emblem",
  },
  colors: {
    primary: "#45A29E",
    secondary: "#D4AF37",
    promoAccent: "#1a3a38",
    promoCta: "#45A29E",
    page: "#070D0D",
    sidebar: "rgba(5, 10, 10, 0.92)",
    panel: "rgba(12, 28, 28, 0.55)",
    panelGlass: "rgba(12, 28, 28, 0.55)",
    authPage: "#070D0D",
    textHeading: "#F8FAFC",
    textPrimary: "#E2E8F0",
    textMuted: "rgba(148, 163, 184, 0.75)",
    encryptedGreen: "#45A29E",
    vaultGold: "#D4AF37",
    platinumSilver: "#E2E8F0",
    obsidianBlack: "#070D0D",
    borderGlow: "rgba(255, 255, 255, 0.1)",
    borderTeal: "rgba(79, 209, 197, 0.12)",
  },
  fonts: {
    brand: "Space Grotesk",
    ui: "Inter",
  },
  metadata: {
    title: "Secret Millionaire Society | Affiliate Websites Made Simple",
    description:
      "Get your own website that recommends products. When people buy through your links, you earn a commission.",
  },
} as const;

export type BrandConfig = typeof brand;
