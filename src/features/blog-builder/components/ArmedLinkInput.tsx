"use client";

import { motion } from "framer-motion";
import type { ArmedLink } from "../types";
import { isValidAffiliateUrl, normalizeAffiliateUrl } from "../lib/affiliate-url";

interface ArmedLinkInputProps {
  links: ArmedLink[];
  onChange: (links: ArmedLink[]) => void;
}

export function ArmedLinkInput({ links, onChange }: ArmedLinkInputProps) {
  const update = (index: number, field: keyof ArmedLink, value: string) => {
    const next = [...links];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const normalizeAt = (index: number) => {
    const next = [...links];
    next[index] = {
      ...next[index],
      url: normalizeAffiliateUrl(next[index].url),
    };
    onChange(next);
  };

  const add = () => {
    onChange([...links, { label: "My Offer", url: "", network: "digistore" }]);
  };

  const remove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const displayLinks =
    links.length > 0 ? links : [{ label: "DigiStore Offer", url: "", network: "digistore" as const }];

  return (
    <div className="flex flex-col gap-4">
      {displayLinks.map((link, i) => {
        const urlInvalid = link.url.trim().length > 0 && !isValidAffiliateUrl(link.url);
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 flex flex-col gap-3"
          >
            <label className="text-xs text-text-muted uppercase tracking-widest font-bold">
              Armed Link {i + 1}
            </label>
            <input
              type="text"
              placeholder="Offer label (e.g. Best Starter Kit)"
              value={link.label}
              onChange={(e) => update(i, "label", e.target.value)}
              className="input-base w-full"
            />
            <input
              type="text"
              inputMode="url"
              placeholder="https://www.digistore24.com/..."
              value={link.url}
              onChange={(e) => update(i, "url", e.target.value)}
              onBlur={() => normalizeAt(i)}
              className={`input-base w-full ${
                urlInvalid ? "border-amber-500/50 focus:border-amber-500/60" : ""
              }`}
            />
            {urlInvalid && (
              <p className="text-xs text-amber-400/90">
                URL must start with https:// — we&apos;ll try to fix small typos when you leave the
                field.
              </p>
            )}
            {displayLinks.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-red-400/80 self-start hover:text-red-400"
              >
                Remove link
              </button>
            )}
          </motion.div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="text-sm text-accent font-medium self-start hover:underline"
      >
        + Add another armed link
      </button>
      <p className="text-xs text-text-muted leading-relaxed">
        Paste your DigiStore affiliate URL (must include https://). Valid links save to Link Vault
        automatically.
      </p>
    </div>
  );
}
