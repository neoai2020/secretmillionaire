export const brand = {
  productName: "Secret Millionaire Society",
  tagline: "Elite Financial Extraction",
  authTagline: "Secure Initiate Access",
  signupTagline: "Join the Society",
  memberLabel: "Initiate",
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
    page: "#0B0C10",
    sidebar: "#0B0C10",
    panel: "#12141a",
    authPage: "#0B0C10",
    textPrimary: "#C5C6C7",
    textMuted: "#6b7280",
    encryptedGreen: "#45A29E",
    vaultGold: "#D4AF37",
    platinumSilver: "#C5C6C7",
    obsidianBlack: "#0B0C10",
  },
  fonts: {
    brand: "Space Grotesk",
    ui: "Inter",
  },
  metadata: {
    title: "Secret Millionaire Society | Private Extraction Terminal",
    description:
      "Elite financial extraction made push-button simple. Connect, scan, and route unclaimed commissions.",
  },
} as const;

export type BrandConfig = typeof brand;
