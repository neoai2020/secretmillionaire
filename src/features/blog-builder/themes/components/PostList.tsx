import type { HomeListModule, PublicPostSummary } from "../types";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: PublicPostSummary[];
  siteSlug: string;
  variant: HomeListModule;
  /** Posts already shown in hero — exclude from list. */
  excludeSlug?: string;
}

export function PostList({ posts, siteSlug, variant, excludeSlug }: PostListProps) {
  const list = excludeSlug ? posts.filter((p) => p.slug !== excludeSlug) : posts;

  if (list.length === 0) return null;

  const maxWidth =
    variant === "stack" ? "max-w-3xl" : variant === "magazine-mix" ? "max-w-6xl" : "max-w-6xl";

  if (variant === "grid-2") {
    return (
      <section className={`${maxWidth} mx-auto px-4 sm:px-6 py-10 sm:py-12`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--blog-muted)" }}>
          All guides
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {list.map((post) => (
            <PostCard key={post.slug} post={post} siteSlug={siteSlug} layout="grid" />
          ))}
        </div>
      </section>
    );
  }

  if (variant === "magazine-mix") {
    const filtered = list;
    const [first, ...rest] = filtered;
    return (
      <section className={`${maxWidth} mx-auto px-4 sm:px-6 py-10 sm:py-12`}>
        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {first && (
            <PostCard post={first} siteSlug={siteSlug} layout="magazine" featured />
          )}
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} siteSlug={siteSlug} layout="grid" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`${maxWidth} mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col gap-5`}>
      {list.map((post) => (
        <PostCard key={post.slug} post={post} siteSlug={siteSlug} layout="stack" />
      ))}
    </section>
  );
}
