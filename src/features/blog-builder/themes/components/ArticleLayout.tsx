import Link from "next/link";
import type { PostLayoutModule, PublicPost, PublicPostSummary, PublicSite } from "../types";

interface ArticleLayoutProps {
  site: PublicSite;
  siteSlug: string;
  post: PublicPost;
  layout: PostLayoutModule;
  relatedPosts: PublicPostSummary[];
}

function FeaturedImage({ post }: { post: PublicPost }) {
  if (!post.image_url) return null;
  return (
    <figure className="mb-8 -mx-4 sm:mx-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.image_url}
        alt={post.image_alt ?? post.title}
        className="w-full rounded-none sm:rounded-xl object-cover max-h-[420px]"
      />
    </figure>
  );
}

function ArticleBody({ html }: { html: string }) {
  return <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

function RelatedSidebar({
  posts,
  siteSlug,
  currentSlug,
}: {
  posts: PublicPostSummary[];
  siteSlug: string;
  currentSlug: string;
}) {
  const related = posts.filter((p) => p.slug !== currentSlug).slice(0, 5);
  if (related.length === 0) return null;

  return (
    <aside className="lg:col-span-1">
      <div
        className="blog-card p-5 sticky top-6"
        style={{ background: "var(--blog-surface)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--blog-muted)" }}>
          Related guides
        </p>
        <ul className="space-y-4">
          {related.map((p) => (
            <li key={p.slug}>
              <Link href={`/sites/${siteSlug}/${p.slug}`} className="text-sm font-semibold leading-snug hover:opacity-80">
                {p.title}
              </Link>
              {p.excerpt && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--blog-muted)" }}>
                  {p.excerpt}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function ArticleLayout({ site, siteSlug, post, layout, relatedPosts }: ArticleLayoutProps) {
  const published = post.publish_at ?? post.created_at;
  const dateLabel = new Date(published).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const meta = (
    <p className="text-sm mb-6" style={{ color: "var(--blog-muted)" }}>
      {dateLabel} · {site.territory ?? site.hobby}
    </p>
  );

  if (layout === "sidebar") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <article className="lg:col-span-2 min-w-0">
            {meta}
            <FeaturedImage post={post} />
            <ArticleBody html={post.html} />
          </article>
          <RelatedSidebar posts={relatedPosts} siteSlug={siteSlug} currentSlug={post.slug} />
        </div>
      </div>
    );
  }

  const maxWidth = layout === "wide" ? "max-w-4xl" : "max-w-3xl";

  return (
    <article className={`${maxWidth} mx-auto px-4 sm:px-6 py-8 sm:py-12 min-w-0`}>
      {meta}
      <FeaturedImage post={post} />
      <ArticleBody html={post.html} />
    </article>
  );
}
