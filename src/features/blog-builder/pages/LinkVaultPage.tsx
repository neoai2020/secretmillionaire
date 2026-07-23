"use client";

import { useEffect, useRef, useState } from "react";
import { ArmedLinkInput } from "../components/ArmedLinkInput";
import { useBlogBuilder } from "../context/BlogBuilderContext";
import type { ArmedLink } from "../types";

const emptyLink = (): ArmedLink => ({
  label: "DigiStore Offer",
  url: "",
  network: "digistore",
});

export default function LinkVaultPage() {
  const { sessionLoaded, saveLinksToVault } = useBlogBuilder();
  const [links, setLinks] = useState<ArmedLink[]>([emptyLink()]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipAutoSave = useRef(true);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!sessionLoaded || hydrated.current) return;

    fetch("/api/blog/link-vault", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Could not load link vault");
        return r.json();
      })
      .then((data) => {
        const stored = Array.isArray(data.links) ? (data.links as ArmedLink[]) : [];
        setLinks(stored.length > 0 ? stored : [emptyLink()]);
      })
      .catch(() => setError("Could not load link vault"))
      .finally(() => {
        hydrated.current = true;
        setLoading(false);
        skipAutoSave.current = false;
      });
  }, [sessionLoaded]);

  useEffect(() => {
    if (!sessionLoaded || loading || skipAutoSave.current) return;

    const hasValidLink = links.some((l) => l.url.trim().startsWith("http"));
    if (!hasValidLink) return;

    const timer = setTimeout(() => {
      void saveLinksToVault(links)
        .then(() => {
          setSaved(true);
          setError(null);
          setTimeout(() => setSaved(false), 2000);
        })
        .catch(() => setError("Could not save to link vault"));
    }, 500);

    return () => clearTimeout(timer);
  }, [links, sessionLoaded, loading, saveLinksToVault]);

  if (loading) {
    return (
      <div className="page-stack w-full">
        <p className="text-[#6b7280] text-sm animate-pulse">Loading link vault...</p>
      </div>
    );
  }

  return (
    <div className="page-stack w-full page-container">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Saved Links</p>
        <h1 className="brand-font text-2xl sm:text-3xl text-[#C5C6C7] tracking-tight">Link Vault</h1>
        <p className="text-[#9fb0b5] text-base sm:text-lg max-w-2xl leading-relaxed">
          Your DigiStore product links are saved here automatically whenever you add or edit them
          in Step 2 or on this page.
        </p>
      </div>

      <ArmedLinkInput links={links} onChange={setLinks} />

      {error && <p className="text-sm text-red-400/90">{error}</p>}
      {saved && !error && (
        <p className="text-xs text-[#45A29E]">Saved to Link Vault</p>
      )}
    </div>
  );
}
