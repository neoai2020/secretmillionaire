import type { ThemePreset } from "./types";

/** Five modular presets inspired by editorial, magazine, minimal reader, authority review, and affiliate-pro layouts. */
export const THEME_PRESETS: Record<string, ThemePreset> = {
  editorial: {
    id: "editorial",
    name: "Editorial",
    tagline: "Serif headlines, featured guide hero, readable stack",
    fonts: {
      heading: "'Source Serif 4', Georgia, serif",
      body: "'Inter', system-ui, sans-serif",
      googleUrl:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap",
    },
    colors: {
      bg: "#faf9f7",
      surface: "#ffffff",
      text: "#1a1a1a",
      muted: "#5c5c5c",
      accent: "#0d6e6a",
      accentHover: "#095854",
      border: "#e8e4df",
      pillar: "#b8860b",
      heroOverlay: "rgba(13, 110, 106, 0.08)",
    },
    modules: {
      header: "centered",
      hero: "featured-pillar",
      homeList: "stack",
      postLayout: "narrow",
      footer: "simple",
    },
  },

  magazine: {
    id: "magazine",
    name: "Magazine",
    tagline: "Image-forward grid, split header, wide article canvas",
    fonts: {
      heading: "'Fraunces', Georgia, serif",
      body: "'DM Sans', system-ui, sans-serif",
      googleUrl:
        "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap",
    },
    colors: {
      bg: "#f4f2ef",
      surface: "#ffffff",
      text: "#121212",
      muted: "#666666",
      accent: "#c45c26",
      accentHover: "#a34a1e",
      border: "#e0dcd6",
      pillar: "#c45c26",
      heroOverlay: "rgba(196, 92, 38, 0.12)",
    },
    modules: {
      header: "split",
      hero: "featured-pillar",
      homeList: "magazine-mix",
      postLayout: "wide",
      footer: "rich",
    },
  },

  minimal: {
    id: "minimal",
    name: "Minimal Reader",
    tagline: "Distraction-free Substack-style reading experience",
    fonts: {
      heading: "'Literata', Georgia, serif",
      body: "'Inter', system-ui, sans-serif",
      googleUrl:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Literata:opsz,wght@7..72,600;7..72,700&display=swap",
    },
    colors: {
      bg: "#ffffff",
      surface: "#ffffff",
      text: "#111111",
      muted: "#737373",
      accent: "#2563eb",
      accentHover: "#1d4ed8",
      border: "#eeeeee",
      pillar: "#2563eb",
      heroOverlay: "transparent",
    },
    modules: {
      header: "minimal",
      hero: "none",
      homeList: "stack",
      postLayout: "narrow",
      footer: "simple",
    },
  },

  authority: {
    id: "authority",
    name: "Authority",
    tagline: "Trust-first review site with sidebar navigation",
    fonts: {
      heading: "'Plus Jakarta Sans', system-ui, sans-serif",
      body: "'Plus Jakarta Sans', system-ui, sans-serif",
      googleUrl:
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
    },
    colors: {
      bg: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      accent: "#0284c7",
      accentHover: "#0369a1",
      border: "#e2e8f0",
      pillar: "#0284c7",
      heroOverlay: "rgba(2, 132, 199, 0.06)",
    },
    modules: {
      header: "split",
      hero: "cta-banner",
      homeList: "grid-2",
      postLayout: "sidebar",
      footer: "rich",
    },
  },

  "affiliate-pro": {
    id: "affiliate-pro",
    name: "Affiliate Pro",
    tagline: "Conversion-focused cards, CTA hero, scannable wide layout",
    fonts: {
      heading: "'Outfit', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
      googleUrl:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@600;700&display=swap",
    },
    colors: {
      bg: "#f5f5f4",
      surface: "#ffffff",
      text: "#1c1917",
      muted: "#57534e",
      accent: "#059669",
      accentHover: "#047857",
      border: "#e7e5e4",
      pillar: "#d97706",
      heroOverlay: "rgba(5, 150, 105, 0.1)",
    },
    modules: {
      header: "centered",
      hero: "cta-banner",
      homeList: "grid-2",
      postLayout: "wide",
      footer: "rich",
    },
  },
};

export const PRESET_IDS = Object.keys(THEME_PRESETS);
