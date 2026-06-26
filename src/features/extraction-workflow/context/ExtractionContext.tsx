"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "@/lib/supabase";

export type ExtractionStep = 0 | 1 | 2 | 3;

interface ExtractionState {
  step: ExtractionStep;
  connected: boolean;
  scanned: boolean;
  extracted: boolean;
  balance: number;
  commissionsFound: number;
  isConnecting: boolean;
  isScanning: boolean;
  isRouting: boolean;
}

interface ExtractionContextType extends ExtractionState {
  sessionLoaded: boolean;
  connect: () => Promise<void>;
  scan: () => Promise<void>;
  extract: () => Promise<void>;
  resetSession: () => Promise<void>;
}

const defaultState: ExtractionState = {
  step: 0,
  connected: false,
  scanned: false,
  extracted: false,
  balance: 0,
  commissionsFound: 0,
  isConnecting: false,
  isScanning: false,
  isRouting: false,
};

const LEGACY_KEY = "sms_extraction_state";

interface DbExtractionRow {
  step?: number;
  connected?: boolean;
  scanned?: boolean;
  extracted?: boolean;
  balance?: number;
  commissions_found?: number;
}

function mapFromDb(row: DbExtractionRow): Partial<ExtractionState> {
  return {
    step: (row.step ?? 0) as ExtractionStep,
    connected: row.connected ?? false,
    scanned: row.scanned ?? false,
    extracted: row.extracted ?? false,
    balance: Number(row.balance ?? 0),
    commissionsFound: Number(row.commissions_found ?? 0),
  };
}

function persistPayload(state: ExtractionState) {
  return {
    step: state.step,
    connected: state.connected,
    scanned: state.scanned,
    extracted: state.extracted,
    balance: state.balance,
    commissionsFound: state.commissionsFound,
  };
}

const ExtractionContext = createContext<ExtractionContextType | undefined>(undefined);

export function ExtractionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ExtractionState>(defaultState);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const persistReady = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LEGACY_KEY);
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/extraction/session", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (json.session) {
          setState((s) => ({ ...s, ...mapFromDb(json.session as DbExtractionRow) }));
        }
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

  useEffect(() => {
    if (!persistReady.current) return;

    const timer = setTimeout(() => {
      void fetch("/api/extraction/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(persistPayload(state)),
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    state.step,
    state.connected,
    state.scanned,
    state.extracted,
    state.balance,
    state.commissionsFound,
  ]);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true }));
    await new Promise((r) => setTimeout(r, 2800));
    setState((s) => ({
      ...s,
      isConnecting: false,
      connected: true,
      step: 1,
    }));
  }, []);

  const scan = useCallback(async () => {
    setState((s) => ({ ...s, isScanning: true }));
    await new Promise((r) => setTimeout(r, 3500));
    const found = 127.43 + Math.random() * 80;
    setState((s) => ({
      ...s,
      isScanning: false,
      scanned: true,
      step: 2,
      commissionsFound: Math.round(found * 100) / 100,
    }));
  }, []);

  const extract = useCallback(async () => {
    setState((s) => ({ ...s, isRouting: true }));
    await new Promise((r) => setTimeout(r, 2200));
    setState((s) => ({
      ...s,
      isRouting: false,
      extracted: true,
      step: 3,
      balance: s.balance + s.commissionsFound,
      commissionsFound: 0,
    }));
  }, []);

  const resetSession = useCallback(async () => {
    await fetch("/api/extraction/session", { method: "DELETE", cache: "no-store" });
    setState(defaultState);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  return (
    <ExtractionContext.Provider
      value={{
        ...state,
        sessionLoaded,
        connect,
        scan,
        extract,
        resetSession,
      }}
    >
      {children}
    </ExtractionContext.Provider>
  );
}

export function useExtraction() {
  const ctx = useContext(ExtractionContext);
  if (!ctx) throw new Error("useExtraction must be used within ExtractionProvider");
  return ctx;
}
