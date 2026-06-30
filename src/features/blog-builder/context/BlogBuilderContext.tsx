"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ArmedLink, BlogPost, BlogSite } from "../types";
import { isValidAffiliateUrl, normalizeAffiliateUrl } from "../lib/affiliate-url";

export type BlogBuilderStep = 0 | 1 | 2 | 3;

interface BlogBuilderState {
  step: BlogBuilderStep;
  hobby: string;
  territory: string;
  suggestions: string[];
  armedLinks: ArmedLink[];
  territoryChosen: boolean;
  linksArmed: boolean;
  deployed: boolean;
  siteId: string | null;
  siteSlug: string | null;
  isGenerating: boolean;
  generationLog: string[];
}

interface BlogBuilderContextType extends BlogBuilderState {
  sessionLoaded: boolean;
  setHobby: (h: string) => void;
  setTerritory: (t: string) => void;
  setSuggestions: (s: string[]) => void;
  setArmedLinks: (links: ArmedLink[]) => void;
  chooseTerritory: (territory: string) => void;
  armLinks: (links: ArmedLink[]) => void;
  saveLinksToVault: (links: ArmedLink[]) => Promise<void>;
  markDeployed: (siteId: string, siteSlug: string) => void;
  appendLog: (line: string) => void;
  setGenerating: (v: boolean) => void;
  resetWizard: () => void;
  beginNewSiteGeneration: () => void;
  blogProgress: number;
}

const defaultState: BlogBuilderState = {
  step: 0,
  hobby: "",
  territory: "",
  suggestions: [],
  armedLinks: [],
  territoryChosen: false,
  linksArmed: false,
  deployed: false,
  siteId: null,
  siteSlug: null,
  isGenerating: false,
  generationLog: [],
};

const LEGACY_KEYS = ["sms_blog_builder_state", "sms_link_vault"] as const;

function clearLegacyClientStorage() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}

interface DbSessionRow {
  step?: number;
  hobby?: string;
  territory?: string;
  suggestions?: string[];
  territory_chosen?: boolean;
  links_armed?: boolean;
  deployed?: boolean;
  site_id?: string | null;
  site_slug?: string | null;
  is_generating?: boolean;
  generation_log?: string[];
}

function mapSessionFromDb(row: DbSessionRow): Partial<BlogBuilderState> {
  return {
    step: (row.step ?? 0) as BlogBuilderStep,
    hobby: row.hobby ?? "",
    territory: row.territory ?? "",
    suggestions: row.suggestions ?? [],
    territoryChosen: row.territory_chosen ?? false,
    linksArmed: row.links_armed ?? false,
    deployed: row.deployed ?? false,
    siteId: row.site_id ?? null,
    siteSlug: row.site_slug ?? null,
    isGenerating: row.is_generating ?? false,
    generationLog: Array.isArray(row.generation_log) ? row.generation_log : [],
  };
}

function persistPayload(state: BlogBuilderState) {
  return {
    step: state.step,
    hobby: state.hobby,
    territory: state.territory,
    suggestions: state.suggestions,
    territoryChosen: state.territoryChosen,
    linksArmed: state.linksArmed,
    deployed: state.deployed,
    siteId: state.siteId,
    siteSlug: state.siteSlug,
    isGenerating: state.isGenerating,
    generationLog: state.generationLog,
  };
}

function vaultReadyLinks(links: ArmedLink[]): ArmedLink[] {
  const seen = new Set<string>();
  return links
    .map((link) => ({
      ...link,
      url: normalizeAffiliateUrl(link.url),
    }))
    .filter((link) => {
      const url = link.url.trim();
      if (!isValidAffiliateUrl(url) || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
}

const BlogBuilderContext = createContext<BlogBuilderContextType | undefined>(undefined);

export function BlogBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BlogBuilderState>(defaultState);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const persistReady = useRef(false);

  useEffect(() => {
    clearLegacyClientStorage();

    let cancelled = false;

    async function load() {
      try {
        const [sessionRes, vaultRes] = await Promise.all([
          fetch("/api/blog/session", { cache: "no-store" }),
          fetch("/api/blog/link-vault", { cache: "no-store" }),
        ]);

        const sessionJson = sessionRes.ok ? await sessionRes.json() : { session: null };
        const vaultJson = vaultRes.ok ? await vaultRes.json() : { links: [] };

        if (cancelled) return;

        const fromSession = sessionJson.session
          ? mapSessionFromDb(sessionJson.session as DbSessionRow)
          : {};

        const vaultLinks = Array.isArray(vaultJson.links) ? (vaultJson.links as ArmedLink[]) : [];

        setState((s) => ({
          ...s,
          ...fromSession,
          armedLinks: vaultLinks.length > 0 ? vaultLinks : s.armedLinks,
        }));
      } finally {
        if (!cancelled) {
          setSessionLoaded(true);
          persistReady.current = true;
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistToServer = useCallback((payload: ReturnType<typeof persistPayload>) => {
    void fetch("/api/blog/session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
  }, []);

  useEffect(() => {
    if (!persistReady.current) return;

    const timer = setTimeout(() => {
      persistToServer(persistPayload(state));
    }, 400);

    return () => clearTimeout(timer);
  }, [
    state.step,
    state.hobby,
    state.territory,
    state.suggestions,
    state.territoryChosen,
    state.linksArmed,
    state.deployed,
    state.siteId,
    state.siteSlug,
    state.generationLog,
    persistToServer,
  ]);

  const persistVault = useCallback(async (links: ArmedLink[]) => {
    const res = await fetch("/api/blog/link-vault", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ links }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to save link vault");
    }
  }, []);

  const setHobby = useCallback((hobby: string) => {
    setState((s) => ({ ...s, hobby }));
  }, []);

  const setTerritory = useCallback((territory: string) => {
    setState((s) => ({ ...s, territory }));
  }, []);

  const setSuggestions = useCallback((suggestions: string[]) => {
    setState((s) => ({ ...s, suggestions }));
  }, []);

  const setArmedLinks = useCallback((armedLinks: ArmedLink[]) => {
    setState((s) => ({ ...s, armedLinks }));
  }, []);

  const chooseTerritory = useCallback((territory: string) => {
    setState((s) => ({
      ...s,
      territory,
      territoryChosen: true,
      step: 1,
    }));
  }, []);

  const saveLinksToVault = useCallback(
    async (links: ArmedLink[]) => {
      const cleaned = vaultReadyLinks(links);
      if (cleaned.length === 0) return;

      setState((s) => ({ ...s, armedLinks: cleaned }));
      await persistVault(cleaned);
    },
    [persistVault]
  );

  const armLinks = useCallback(
    (armedLinks: ArmedLink[]) => {
      const cleaned = vaultReadyLinks(armedLinks);
      setState((s) => ({
        ...s,
        armedLinks: cleaned,
        linksArmed: cleaned.length > 0,
        step: 2,
      }));
    },
    []
  );

  const markDeployed = useCallback((siteId: string, siteSlug: string) => {
    setState((s) => ({
      ...s,
      siteId,
      siteSlug,
      deployed: true,
      step: 3,
      isGenerating: false,
    }));
  }, []);

  const appendLog = useCallback((line: string) => {
    setState((s) => ({
      ...s,
      generationLog: [...s.generationLog, line],
    }));
  }, []);

  const setGenerating = useCallback(
    (isGenerating: boolean) => {
      setState((s) => {
        const next = {
          ...s,
          isGenerating,
          generationLog: isGenerating ? [] : s.generationLog,
        };
        persistToServer(persistPayload(next));
        return next;
      });
    },
    [persistToServer]
  );

  const resetWizard = useCallback(async () => {
    await fetch("/api/blog/session", { method: "DELETE", cache: "no-store" });
    setState(defaultState);
  }, []);

  const beginNewSiteGeneration = useCallback(() => {
    setState((s) => ({
      ...s,
      deployed: false,
      siteId: null,
      siteSlug: null,
      step: 2,
      isGenerating: false,
      generationLog: [],
    }));
  }, []);

  let blogProgress = 0;
  if (state.deployed || state.step >= 3) blogProgress = 3;
  else if (state.linksArmed || state.step >= 2) blogProgress = 2;
  else if (state.territoryChosen || state.step >= 1) blogProgress = 1;

  return (
    <BlogBuilderContext.Provider
      value={{
        ...state,
        sessionLoaded,
        setHobby,
        setTerritory,
        setSuggestions,
        setArmedLinks,
        chooseTerritory,
        armLinks,
        saveLinksToVault,
        markDeployed,
        appendLog,
        setGenerating,
        resetWizard,
        beginNewSiteGeneration,
        blogProgress,
      }}
    >
      {children}
    </BlogBuilderContext.Provider>
  );
}

export function useBlogBuilder() {
  const ctx = useContext(BlogBuilderContext);
  if (!ctx) throw new Error("useBlogBuilder must be used within BlogBuilderProvider");
  return ctx;
}

export type { BlogSite, BlogPost, ArmedLink };
