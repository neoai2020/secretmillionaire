"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  FolderOpen,
  Globe,
  Plus,
} from "lucide-react";
import { getAppUrl } from "@/lib/brand-vars";
import { AssetFolderCard, type SiteVaultSummary } from "../components/AssetFolderCard";
import { PostCard } from "../components/PostCard";
import { FacebookPostCard } from "../components/FacebookPostCard";
import { getSiteTerritory } from "../lib/site-territory";
import type { SavedFacebookPost } from "../lib/facebook-posts-vault";
import type { BlogPost, BlogSite } from "../types";

interface GenerationQuota {
  limit: number;
  usedToday: number;
  remaining: number;
}

export default function AssetCommandPage() {
  const [summaries, setSummaries] = useState<SiteVaultSummary[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<BlogSite | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [facebookPosts, setFacebookPosts] = useState<SavedFacebookPost[]>([]);
  const [clicks, setClicks] = useState(0);
  const [quota, setQuota] = useState<GenerationQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSiteId, setOpenSiteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/blog/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setSummaries(Array.isArray(data.summaries) ? data.summaries : []);
        if (data.quota) setQuota(data.quota);
        if (data.activeSiteId) setActiveSiteId(data.activeSiteId);
      })
      .finally(() => setLoading(false));
  }, []);

  const openFolder = async (siteId: string) => {
    setOpenSiteId(siteId);
    setDetailLoading(true);
    setSelectedSite(null);
    setPosts([]);
    setFacebookPosts([]);

    try {
      const res = await fetch(`/api/blog/site?siteId=${encodeURIComponent(siteId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load site");

      setSelectedSite(data.site as BlogSite);
      setPosts(data.posts ?? []);
      setFacebookPosts(Array.isArray(data.facebookPosts) ? data.facebookPosts : []);
      setClicks(data.clicks ?? 0);
      if (Array.isArray(data.summaries)) setSummaries(data.summaries);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeFolder = () => {
    setOpenSiteId(null);
    setSelectedSite(null);
    setPosts([]);
    setFacebookPosts([]);
    setClicks(0);
  };

  const publicUrl = selectedSite
    ? `${typeof window !== "undefined" ? window.location.origin : getAppUrl()}/sites/${selectedSite.slug}`
    : "";

  const resolveFacebookPost = (body: string) =>
    publicUrl ? body.split("[LINK]").join(publicUrl) : body;

  const copyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <p className="text-[#9fb0b5] text-base animate-pulse">Loading your websites...</p>;
  }

  if (summaries.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto">
        <VaultHeader quota={quota} siteCount={0} />
        <div className="rounded-xl border border-dashed border-white/15 p-10 text-center flex flex-col items-center gap-4">
          <FolderOpen className="text-[#6b7280]" size={40} strokeWidth={1.25} />
          <p className="text-[#6b7280] text-sm max-w-md">
            Your vault is empty. Deploy a website and it will appear here as a saved folder.
          </p>
          <Link
            href="/territory"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#45A29E] text-[#0B0C10] text-sm font-bold"
          >
            <Globe size={16} />
            Pick Your Topic
          </Link>
        </div>
      </div>
    );
  }

  if (openSiteId) {
    const summary = summaries.find((s) => s.site.id === openSiteId);

    return (
      <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl w-full mx-auto">
        <button
          type="button"
          onClick={closeFolder}
          className="inline-flex items-center gap-2 text-sm text-[#45A29E] hover:underline w-fit"
        >
          <ArrowLeft size={16} />
          Back to My Websites
        </button>

        {detailLoading || !selectedSite ? (
          <p className="text-[#6b7280] text-sm animate-pulse">Opening folder...</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                Site folder
              </p>
              <h1 className="brand-font text-2xl sm:text-3xl text-[#C5C6C7] tracking-tight">
                {selectedSite.title}
              </h1>
              <p className="text-[#6b7280] text-sm">{getSiteTerritory(selectedSite)}</p>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">
                  Public website
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
                  href={`/sites/${selectedSite.slug}`}
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
                <p className="brand-font text-lg text-accent capitalize">{selectedSite.status}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="brand-font text-lg text-text-heading">Published articles</h2>
              {posts.length === 0 ? (
                <p className="text-sm text-text-muted">No articles in this folder yet.</p>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} siteSlug={selectedSite.slug} />
                ))
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="brand-font text-lg text-text-heading">Facebook posts (Accelerator)</h2>
                {facebookPosts.length > 0 && (
                  <Link
                    href="/accelerator"
                    className="text-xs font-semibold text-[#45A29E] hover:underline"
                  >
                    Generate more →
                  </Link>
                )}
              </div>
              {facebookPosts.length === 0 ? (
                <p className="text-sm text-text-muted">
                  No Facebook posts saved yet. Generate posts in{" "}
                  <Link href="/accelerator" className="text-[#45A29E] hover:underline">
                    Accelerator
                  </Link>{" "}
                  — each batch is saved here automatically.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {facebookPosts.map((post) => (
                    <FacebookPostCard
                      key={post.id}
                      post={post}
                      resolvedText={resolveFacebookPost(post.body)}
                    />
                  ))}
                </div>
              )}
            </div>

            {summary && (
              <p className="text-xs text-text-muted">
                Created {new Date(selectedSite.created_at).toLocaleString()} ·{" "}
                {summary.livePostCount} live of {summary.postCount} posts
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  const latestSiteId = activeSiteId ?? summaries[0]?.site.id ?? null;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl w-full mx-auto">
      <VaultHeader quota={quota} siteCount={summaries.length} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((summary) => (
          <AssetFolderCard
            key={summary.site.id}
            summary={summary}
            isActive={summary.site.id === latestSiteId}
            onOpen={() => openFolder(summary.site.id)}
          />
        ))}

        {quota && quota.remaining > 0 && (
          <Link
            href="/territory"
            className="rounded-xl border border-dashed border-[#45A29E]/35 p-4 sm:p-5 flex flex-col items-center justify-center gap-3 min-h-[140px] text-center hover:border-[#45A29E]/55 hover:bg-[#45A29E]/5 transition-colors"
          >
            <div className="w-11 h-11 rounded-lg bg-[#45A29E]/10 text-[#45A29E] flex items-center justify-center">
              <Plus size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-heading">New website</p>
              <p className="text-xs text-text-muted mt-1">{quota.remaining} generations left today</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

function VaultHeader({
  quota,
  siteCount,
}: {
  quota: GenerationQuota | null;
  siteCount: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
          My Websites
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-[#C5C6C7] tracking-tight">
          Your websites
        </h1>
        <p className="text-[#9fb0b5] text-base max-w-2xl leading-relaxed">
          Every website you launch is saved here. Open one to see its articles, visitor clicks, and
          public link.
        </p>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
        <p className="text-xs text-text-muted">
          {siteCount} {siteCount === 1 ? "site" : "sites"} saved
        </p>
        {quota && (
          <p className="text-xs text-[#45A29E]/90">
            {quota.remaining} of {quota.limit} new sites remaining today
          </p>
        )}
      </div>
    </div>
  );
}
