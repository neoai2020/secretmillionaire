import { THEME_PRESETS } from "./presets";
import type { ResolvedTheme, ThemeModules, ThemePreset } from "./types";

const LEGACY_THEME_MAP: Record<string, string> = {
  obsidian: "editorial",
};

const DEFAULT_PRESET = THEME_PRESETS.editorial;

function mergeModules(home: ThemePreset, post?: ThemePreset): ThemeModules {
  if (!post || post.id === home.id) return home.modules;
  return {
    header: home.modules.header,
    hero: home.modules.hero,
    homeList: home.modules.homeList,
    postLayout: post.modules.postLayout,
    footer: post.modules.footer,
  };
}

/**
 * Resolve a site theme string into a composable layout config.
 * Supports single presets (`editorial`) or composites (`magazine|minimal`).
 */
export function resolveTheme(themeKey: string | null | undefined): ResolvedTheme {
  const raw = (themeKey ?? "").trim() || DEFAULT_PRESET.id;
  const normalized = LEGACY_THEME_MAP[raw] ?? raw;
  const segments = normalized.split("|").map((s) => s.trim()).filter(Boolean);

  const homeId = segments[0] ?? DEFAULT_PRESET.id;
  const postId = segments[1];

  const home = THEME_PRESETS[homeId] ?? DEFAULT_PRESET;
  const post = postId ? THEME_PRESETS[postId] : undefined;

  return {
    ...home,
    themeKey: normalized,
    modules: mergeModules(home, post),
    name: post && post.id !== home.id ? `${home.name} × ${post.name}` : home.name,
  };
}
