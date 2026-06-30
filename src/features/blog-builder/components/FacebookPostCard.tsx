"use client";

import { useState } from "react";
import { Copy, Check, Facebook } from "lucide-react";
import { clsx } from "clsx";
import type { SavedFacebookPost } from "../lib/facebook-posts-vault";

interface FacebookPostCardProps {
  post: SavedFacebookPost;
  resolvedText: string;
}

export function FacebookPostCard({ post, resolvedText }: FacebookPostCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-black/30 border border-white/5 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-muted">
          <Facebook size={12} className="text-accent" />
          {new Date(post.created_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap flex-1">
        {resolvedText}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className={clsx(
          "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all self-start",
          copied ? "bg-green-500 text-black" : "btn-primary"
        )}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Copy Post
          </>
        )}
      </button>
    </div>
  );
}
