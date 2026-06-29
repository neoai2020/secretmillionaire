import type { HomeListModule, PublicPostSummary } from "../types";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: PublicPostSummary[];
  siteSlug: string;
  variant: HomeListModule;
  excludeSlug?: string;
}

export function PostList({ posts, siteSlug, variant, excludeSlug }: PostListProps) {
  const list = excludeSlug ? posts.filter((p) => p.slug !== excludeSlug) : posts;
  if (list.length === 0) return null;

  if (variant === "bento") {
    return (
      <section className="blog-section">
        <div className="blog-section-head">
          <h2 className="blog-section-title">Latest guides</h2>
          <span className="blog-meta">{list.length} articles</span>
        </div>
        <div className="blog-bento">
          {list.map((post, i) => (
            <PostCard key={post.slug} post={post} siteSlug={siteSlug} layout="bento" featured={i === 0} />
          ))}
        </div>
      </section>
    );
  }

  if (variant === "horizontal") {
    return (
      <section className="blog-section">
        <div className="blog-section-head">
          <h2 className="blog-section-title">All guides</h2>
          <span className="blog-meta">{list.length} articles</span>
        </div>
        <div className="blog-stack">
          {list.map((post) => (
            <PostCard key={post.slug} post={post} siteSlug={siteSlug} layout="horizontal" />
          ))}
        </div>
      </section>
    );
  }

  if (variant === "grid-2") {
    return (
      <section className="blog-section">
        <div className="blog-section-head">
          <h2 className="blog-section-title">Browse guides</h2>
          <span className="blog-meta">{list.length} articles</span>
        </div>
        <div className="blog-grid-3">
          {list.map((post) => (
            <PostCard key={post.slug} post={post} siteSlug={siteSlug} layout="grid" />
          ))}
        </div>
      </section>
    );
  }

  if (variant === "magazine-mix") {
    const [first, ...rest] = list;
    return (
      <section className="blog-section">
        <div className="blog-bento">
          {first && <PostCard post={first} siteSlug={siteSlug} layout="bento" featured />}
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} siteSlug={siteSlug} layout="bento" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="blog-section">
      <div className="blog-section-head">
        <h2 className="blog-section-title">Articles</h2>
      </div>
      <div className="blog-stack max-w-3xl">
        {list.map((post) => (
          <PostCard key={post.slug} post={post} siteSlug={siteSlug} layout="stack" />
        ))}
      </div>
    </section>
  );
}
