"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Check, Link2, Loader2, Plus } from "lucide-react";
import type { ArmedLink } from "@/features/blog-builder/types";
import { isValidAffiliateUrl, normalizeAffiliateUrl } from "@/features/blog-builder/lib/affiliate-url";
import { saveToLinkVault } from "@/lib/save-to-link-vault";

interface AffiliateLinkPickerProps {
  value: string;
  onChange: (url: string) => void;
}

function truncateUrl(url: string, max = 42): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 3)}...`;
}

export function AffiliateLinkPicker({ value, onChange }: AffiliateLinkPickerProps) {
  const [vaultLinks, setVaultLinks] = useState<ArmedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState("My Offer");
  const [customUrl, setCustomUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedHint, setSavedHint] = useState(false);

  const loadVault = useCallback(async () => {
    try {
      const res = await fetch("/api/blog/link-vault", { cache: "no-store" });
      const data = res.ok ? await res.json() : { links: [] };
      const links = (Array.isArray(data.links) ? data.links : []).filter((link: ArmedLink) =>
        isValidAffiliateUrl(link.url)
      ) as ArmedLink[];
      setVaultLinks(links);
      return links;
    } catch {
      setVaultLinks([]);
      return [];
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadVault().then((links) => {
      if (cancelled) return;

      const normalizedValue = normalizeAffiliateUrl(value);
      const inVault = links.some((l) => normalizeAffiliateUrl(l.url) === normalizedValue);

      if (value && !inVault) {
        setShowCustom(true);
        setCustomUrl(value);
      } else if (links.length === 0) {
        setShowCustom(true);
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [loadVault, value]);

  const selectedNormalized = normalizeAffiliateUrl(value);

  const selectVaultLink = (link: ArmedLink) => {
    setShowCustom(false);
    setCustomUrl("");
    onChange(normalizeAffiliateUrl(link.url));
  };

  const applyCustomLink = async () => {
    const url = normalizeAffiliateUrl(customUrl);
    if (!isValidAffiliateUrl(url)) return;

    onChange(url);
    setSaving(true);

    try {
      const ok = await saveToLinkVault(customLabel.trim() || "My Offer", url);
      if (ok) {
        await loadVault();
        setSavedHint(true);
        setTimeout(() => setSavedHint(false), 2000);
        setShowCustom(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading your saved links...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {vaultLinks.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Saved armed links
            </p>
            <Link
              href="/link-vault"
              className="text-[11px] font-semibold text-text-muted hover:text-accent transition"
            >
              Manage vault →
            </Link>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {vaultLinks.map((link) => {
              const normalized = normalizeAffiliateUrl(link.url);
              const isSelected = !showCustom && selectedNormalized === normalized;

              return (
                <button
                  key={normalized}
                  type="button"
                  onClick={() => selectVaultLink(link)}
                  className={clsx(
                    "rounded-xl border p-4 text-left transition",
                    isSelected
                      ? "border-accent/50 bg-accent/[0.08] ring-1 ring-accent/30"
                      : "border-white/10 bg-white/[0.03] hover:border-accent/30 hover:bg-white/[0.05]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-heading truncate">{link.label}</p>
                      <p className="mt-1 text-[11px] text-text-muted truncate">
                        {truncateUrl(normalized)}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-black">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!showCustom && vaultLinks.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setShowCustom(true);
            setCustomUrl("");
            setCustomLabel("My Offer");
          }}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-accent hover:underline"
        >
          <Plus size={16} />
          Add a new link
        </button>
      )}

      {(showCustom || vaultLinks.length === 0) && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2">
            <Link2 className="text-accent" size={16} />
            <p className="text-sm font-bold text-text-heading">
              {vaultLinks.length > 0 ? "Add a new armed link" : "Enter your affiliate link"}
            </p>
          </div>

          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Offer label (e.g. Weight Loss Offer)"
            className="input-base w-full"
          />
          <input
            type="url"
            value={customUrl}
            onChange={(e) => {
              setCustomUrl(e.target.value);
              const normalized = normalizeAffiliateUrl(e.target.value);
              if (isValidAffiliateUrl(normalized)) onChange(normalized);
            }}
            onBlur={() => {
              const normalized = normalizeAffiliateUrl(customUrl);
              if (isValidAffiliateUrl(normalized)) onChange(normalized);
            }}
            placeholder="https://www.digistore24.com/redir/..."
            className="input-base w-full"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void applyCustomLink()}
              disabled={!isValidAffiliateUrl(customUrl) || saving}
              className="btn-primary px-4 py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & use this link"
              )}
            </button>

            {vaultLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className="text-xs font-semibold text-text-muted hover:text-text-secondary"
              >
                Back to saved links
              </button>
            )}
          </div>

          {savedHint && (
            <p className="text-xs text-[#45A29E]">Saved to Link Vault — you can reuse it anywhere.</p>
          )}
        </div>
      )}
    </div>
  );
}
