"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Globe, ExternalLink } from "lucide-react";
import { getAppUrl } from "@/lib/brand-vars";
import { PostCard } from "../components/PostCard";
import type { BlogPost, BlogSite } from "../types";

export default function AssetCommandPage() {
  const [site, setSite] = useState<BlogSite | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [clicks, setClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/blog/site")
      .then((r) => r.json())
      .then((data) => {
        setSite(data.site);
        setPosts(data.posts ?? []);
        setClicks(data.clicks ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const publicUrl = site
    ? `${typeof window !== "undefined" ? window.location.origin : getAppUrl()}/sites/${site.slug}`
    : "";

  const copyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <p className="text-[#6b7280] text-sm animate-pulse">Loading asset command...</p>;
  }

  if (!site) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl w-full mx-auto">
        <h1 className="brand-font text-2xl text-[#C5C6C7]">Asset Command</h1>
        <p className="text-[#6b7280]">No cash asset deployed yet.</p>
        <Link
          href="/territory"
          className="inline-flex items-center gap-2 text-[#45A29E] font-medium hover:underline w-fit"
        >
          <Globe size={18} />
          Start Empire Builder →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Live Asset</p>
        <h1 className="brand-font text-2xl sm:text-3xl text-[#C5C6C7] tracking-tight">
          {site.title}
        </h1>
        <p className="text-[#6b7280] text-sm">{site.tagline}</p>
      </div>

      <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">
            Public money site
          </p>
          <p className="text-sm text-[#C5C6C7] break-all">{publicUrl}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#45A29E]/40 text-[#45A29E] text-sm font-medium"
          >
            <Copy size={16} />
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <Link
            href={`/sites/${site.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#45A29E] text-[#0B0C10] text-sm font-bold"
          >
            View <ExternalLink size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass-tile text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Posts</p>
          <p className="brand-font text-2xl text-text-heading">{posts.length}</p>
        </div>
        <div className="glass-tile text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Clicks</p>
          <p className="brand-font text-2xl text-accent-muted">{clicks}</p>
        </div>
        <div className="glass-tile text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Status</p>
          <p className="brand-font text-lg text-accent capitalize">{site.status}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="brand-font text-lg text-text-heading">Published posts</h2>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} siteSlug={site.slug} />
        ))}
      </div>
    </div>
  );
}
