"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { BlogPost } from "../types";

export function PostCard({ post, siteSlug }: { post: BlogPost; siteSlug: string }) {
  const href = `/sites/${siteSlug}/${post.slug}`;
  return (
    <div className="rounded-xl border border-[#1e2128] bg-[#12141a] p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          {post.is_pillar && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              Pillar
            </span>
          )}
          <h3 className="brand-font text-[#C5C6C7] text-base">{post.title}</h3>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
            post.status === "live"
              ? "bg-[#45A29E]/20 text-[#45A29E]"
              : "bg-[#6b7280]/20 text-[#6b7280]"
          }`}
        >
          {post.status}
        </span>
      </div>
      {post.excerpt && <p className="text-xs text-[#6b7280] line-clamp-2">{post.excerpt}</p>}
      <div className="flex items-center gap-4 text-xs text-[#6b7280] mt-1">
        <span>{post.views} views</span>
        {post.status === "live" && (
          <Link
            href={href}
            target="_blank"
            className="inline-flex items-center gap-1 text-[#45A29E] hover:underline"
          >
            View live <ExternalLink size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}
