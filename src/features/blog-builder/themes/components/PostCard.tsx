import Link from "next/link";
import type { PublicPostSummary } from "../types";

interface PostCardProps {
  post: PublicPostSummary;
  siteSlug: string;
  layout: "stack" | "grid" | "magazine";
  featured?: boolean;
}

export function PostCard({ post, siteSlug, layout, featured }: PostCardProps) {
  const href = `/sites/${siteSlug}/${post.slug}`;

  if (layout === "magazine" && featured) {
    return (
      <article className="blog-card overflow-hidden md:col-span-2 grid md:grid-cols-2 gap-0">
        {post.image_url && (
          <Link href={href} className="relative aspect-[16/10] md:aspect-auto md:min-h-[220px] block bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </Link>
        )}
        <div className="p-6 flex flex-col justify-center">
          {post.is_pillar && <span className="blog-pillar-badge mb-2">Pillar guide</span>}
          <h2 className="text-xl sm:text-2xl font-bold leading-snug">
            <Link href={href} className="hover:opacity-80 transition-opacity">
              {post.title}
            </Link>
          </h2>
          {post.excerpt && (
            <p className="mt-2 text-sm leading-relaxed line-clamp-3" style={{ color: "var(--blog-muted)" }}>
              {post.excerpt}
            </p>
          )}
          <Link href={href} className="blog-link text-sm mt-4 inline-block">
            Read article →
          </Link>
        </div>
      </article>
    );
  }

  if (layout === "grid") {
    return (
      <article className="blog-card overflow-hidden flex flex-col h-full">
        {post.image_url && (
          <Link href={href} className="relative aspect-[16/10] block bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </Link>
        )}
        <div className="p-5 flex flex-col flex-1">
          {post.is_pillar && <span className="blog-pillar-badge mb-2">Pillar</span>}
          <h2 className="text-lg font-bold leading-snug flex-1">
            <Link href={href} className="hover:opacity-80 transition-opacity">
              {post.title}
            </Link>
          </h2>
          {post.excerpt && (
            <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: "var(--blog-muted)" }}>
              {post.excerpt}
            </p>
          )}
          <Link href={href} className="blog-link text-sm mt-3 inline-block">
            Read more →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="blog-card p-6 sm:p-7">
      {post.is_pillar && <span className="blog-pillar-badge mb-2">Pillar guide</span>}
      <h2 className="text-xl font-bold leading-snug">
        <Link href={href} className="hover:opacity-80 transition-opacity">
          {post.title}
        </Link>
      </h2>
      {post.excerpt && (
        <p className="mt-2 text-sm sm:text-base leading-relaxed" style={{ color: "var(--blog-muted)" }}>
          {post.excerpt}
        </p>
      )}
      <Link href={href} className="blog-link text-sm mt-4 inline-block">
        Read more →
      </Link>
    </article>
  );
}
