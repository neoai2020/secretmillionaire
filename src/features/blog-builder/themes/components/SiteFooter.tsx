import Link from "next/link";
import type { FooterModule, PublicPostSummary, PublicSite } from "../types";

interface SiteFooterProps {
  site: PublicSite;
  siteSlug: string;
  variant: FooterModule;
  relatedPosts?: PublicPostSummary[];
  currentSlug?: string;
}

export function SiteFooter({
  site,
  siteSlug,
  variant,
  relatedPosts = [],
  currentSlug,
}: SiteFooterProps) {
  const homeHref = `/sites/${siteSlug}`;
  const category = site.territory ?? site.hobby;
  const related = relatedPosts.filter((p) => p.slug !== currentSlug).slice(0, 4);

  if (variant === "rich") {
    return (
      <footer className="border-t mt-auto" style={{ borderColor: "var(--blog-border)", background: "var(--blog-surface)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-lg">{site.title}</p>
            {site.tagline && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--blog-muted)" }}>
                {site.tagline}
              </p>
            )}
          </div>
          {related.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--blog-muted)" }}>
                More guides
              </p>
              <ul className="space-y-2">
                {related.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/sites/${siteSlug}/${post.slug}`} className="blog-link text-sm font-normal">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--blog-muted)" }}>
              Explore
            </p>
            <Link href={homeHref} className="blog-link text-sm font-normal">
              All {category} articles
            </Link>
          </div>
        </div>
        <div
          className="border-t py-5 text-center text-xs"
          style={{ borderColor: "var(--blog-border)", color: "var(--blog-muted)" }}
        >
          © {new Date().getFullYear()} {site.title}. Independent editorial content.
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="border-t py-8 text-center text-xs mt-auto"
      style={{ borderColor: "var(--blog-border)", color: "var(--blog-muted)" }}
    >
      <Link href={homeHref} className="blog-link font-normal">
        More on {category}
      </Link>
      <p className="mt-3">© {new Date().getFullYear()} {site.title}</p>
    </footer>
  );
}
