"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link2, Loader2, ArrowRight } from "lucide-react";
import { useBlogBuilder } from "../context/BlogBuilderContext";
import {
  ArmedLinkSelector,
  defaultLinkSelection,
  getSelectedArmedLinks,
  selectionFromArmedLinks,
} from "../components/ArmedLinkSelector";
import type { ArmedLink } from "../types";
import { isValidAffiliateUrl } from "../lib/affiliate-url";

const emptyLink = (): ArmedLink => ({
  label: "DigiStore Offer",
  url: "",
  network: "digistore",
});

export default function ArmLinksPage() {
  const router = useRouter();
  const { territoryChosen, territory, hobby, armedLinks, armLinks, saveLinksToVault, sessionLoaded } =
    useBlogBuilder();
  const [links, setLinks] = useState<ArmedLink[]>(
    armedLinks.length > 0 ? armedLinks : [emptyLink()]
  );
  const [selected, setSelected] = useState<Set<number>>(() =>
    defaultLinkSelection(armedLinks.length > 0 ? armedLinks : [emptyLink()])
  );
  const [loading, setLoading] = useState(false);
  const [vaultLoaded, setVaultLoaded] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const skipAutoSave = useRef(true);

  useEffect(() => {
    if (!territoryChosen && !hobby && sessionLoaded) router.replace("/territory");
  }, [territoryChosen, hobby, sessionLoaded, router]);

  useEffect(() => {
    if (!sessionLoaded || vaultLoaded) return;

    fetch("/api/blog/link-vault", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const vault = Array.isArray(data.links) ? (data.links as ArmedLink[]) : [];
        const nextLinks = vault.length > 0 ? vault : armedLinks.length > 0 ? armedLinks : [emptyLink()];
        setLinks(nextLinks);
        setSelected(
          armedLinks.length > 0
            ? selectionFromArmedLinks(nextLinks, armedLinks)
            : defaultLinkSelection(nextLinks)
        );
      })
      .finally(() => {
        setVaultLoaded(true);
        skipAutoSave.current = false;
      });
  }, [sessionLoaded, armedLinks, vaultLoaded]);

  useEffect(() => {
    if (!vaultLoaded || skipAutoSave.current) return;

    const hasValidLink = links.some((l) => isValidAffiliateUrl(l.url));
    if (!hasValidLink) return;

    const timer = setTimeout(() => {
      void saveLinksToVault(links).then(() => {
        setVaultSaved(true);
        setTimeout(() => setVaultSaved(false), 2000);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [links, vaultLoaded, saveLinksToVault]);

  const selectedReady = getSelectedArmedLinks(links, selected);
  const canContinue = selected.size > 0 && selectedReady.length > 0;

  const handleContinue = () => {
    if (selected.size === 0) {
      setLinkError("Select at least one armed link for this deploy — or add a new one and check it.");
      return;
    }

    const cleaned = getSelectedArmedLinks(links, selected);

    if (cleaned.length === 0) {
      const selectedHasText = [...selected].some((i) => links[i]?.url.trim());
      setLinkError(
        selectedHasText
          ? "Fix the selected affiliate URL — it must be a valid link starting with https:// (e.g. https://www.digistore24.com/...)."
          : "Add a valid https affiliate URL to your selected link before continuing."
      );
      return;
    }

    setLinkError(null);
    setLoading(true);
    void saveLinksToVault(links)
      .then(() => {
        armLinks(cleaned);
        router.push("/deploy");
      })
      .catch(() => {
        setLinkError("Could not save links to vault. Try again.");
        setLoading(false);
      });
  };

  if (!sessionLoaded) {
    return <p className="text-[#6b7280] text-sm animate-pulse">Loading your session...</p>;
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Click 2</p>
        <h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-[#C5C6C7] tracking-tight">
          Arm Your Links
        </h1>
        <p className="text-[#6b7280] text-sm sm:text-base max-w-2xl leading-relaxed">
          Choose which affiliate links to weave into your{" "}
          <strong className="text-[#C5C6C7]">{territory || hobby}</strong> money site. Select at
          least one from your vault — or add a new link and check it.
        </p>
      </div>

      <ArmedLinkSelector
        links={links}
        selected={selected}
        onLinksChange={setLinks}
        onSelectedChange={setSelected}
      />

      {vaultSaved && (
        <p className="text-xs text-[#45A29E] text-center">Saved to Link Vault</p>
      )}

      {linkError && (
        <p className="text-sm text-amber-400/90 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          {linkError}
        </p>
      )}

      <motion.button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        className={`w-full max-w-lg mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-xl font-bold text-base sm:text-lg text-[#0B0C10] disabled:opacity-60 ${
          !canContinue && !loading ? "opacity-80" : ""
        }`}
        style={{
          background: "linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)",
          boxShadow: "0 0 40px rgba(69, 162, 158, 0.35)",
        }}
      >
        <span className="flex items-center justify-center gap-3">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={22} />
              Securing links...
            </>
          ) : (
            <>
              <Link2 size={22} />
              Deploy Asset
              {selectedReady.length > 0 && (
                <span className="text-sm font-semibold opacity-90">
                  ({selectedReady.length} link{selectedReady.length === 1 ? "" : "s"})
                </span>
              )}
              <ArrowRight size={22} />
            </>
          )}
        </span>
      </motion.button>
    </div>
  );
}
