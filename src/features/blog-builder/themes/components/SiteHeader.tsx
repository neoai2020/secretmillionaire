import Link from "next/link";
import type { HeaderModule, PublicSite } from "../types";

interface SiteHeaderProps {
  site: PublicSite;
  siteSlug: string;
  variant: HeaderModule;
  backHref?: string;
  backLabel?: string;
  postTitle?: string;
}

export function SiteHeader({
  site,
  siteSlug,
  variant,
  backHref,
  backLabel,
  postTitle,
}: SiteHeaderProps) {
  const homeHref = `/sites/${siteSlug}`;
  const category = site.territory ?? site.hobby;

  if (variant === "minimal") {
    return (
      <header className="border-b" style={{ borderColor: "var(--blog-border)", background: "var(--blog-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          {backHref ? (
            <Link href={backHref} className="blog-link text-sm">
              ← {backLabel ?? site.title}
            </Link>
          ) : (
            <Link href={homeHref} className="blog-link text-sm font-semibold">
              {site.title}
            </Link>
          )}
          {postTitle && (
            <h1 className="text-2xl sm:text-3xl font-bold mt-4 leading-tight tracking-tight">
              {postTitle}
            </h1>
          )}
        </div>
      </header>
    );
  }

  if (variant === "split") {
    return (
      <header className="border-b" style={{ borderColor: "var(--blog-border)", background: "var(--blog-surface)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {backHref ? (
              <Link href={backHref} className="blog-link text-sm mb-3 inline-block">
                ← {backLabel ?? site.title}
              </Link>
            ) : (
              <p className="blog-pillar-badge mb-2">{category}</p>
            )}
            {postTitle ? (
              <h1 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight max-w-3xl">
                {postTitle}
              </h1>
            ) : (
              <>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{site.title}</h1>
                {site.tagline && (
                  <p className="mt-2 text-base sm:text-lg max-w-2xl" style={{ color: "var(--blog-muted)" }}>
                    {site.tagline}
                  </p>
                )}
              </>
            )}
          </div>
          {!postTitle && (
            <p className="text-sm shrink-0" style={{ color: "var(--blog-muted)" }}>
              Expert guides & reviews
            </p>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="border-b" style={{ borderColor: "var(--blog-border)", background: "var(--blog-surface)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-center">
        {backHref ? (
          <Link href={backHref} className="blog-link text-sm inline-block mb-4">
            ← {backLabel ?? site.title}
          </Link>
        ) : (
          <p className="blog-pillar-badge mb-3">{category}</p>
        )}
        {postTitle ? (
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight">{postTitle}</h1>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{site.title}</h1>
            {site.tagline && (
              <p className="mt-3 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--blog-muted)" }}>
                {site.tagline}
              </p>
            )}
          </>
        )}
      </div>
    </header>
  );
}
