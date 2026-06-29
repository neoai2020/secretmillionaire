import Link from "next/link";
import type { HeroModule, PublicPostSummary, PublicSite } from "../types";

interface SiteHeroProps {
  variant: HeroModule;
  site: PublicSite;
  siteSlug: string;
  posts: PublicPostSummary[];
}

export function SiteHero({ variant, site, siteSlug, posts }: SiteHeroProps) {
  if (variant === "none") return null;

  const pillar = posts.find((p) => p.is_pillar) ?? posts[0];
  const category = site.territory ?? site.hobby;

  if (variant === "cta-banner") {
    return (
      <section
        className="border-b"
        style={{ borderColor: "var(--blog-border)", background: "var(--blog-hero-overlay)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="blog-pillar-badge mb-2">Independent guides</p>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug">
              Honest, research-backed advice on {category}
            </h2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--blog-muted)" }}>
              Compare options, avoid common mistakes, and find what fits your budget.
            </p>
          </div>
          {pillar && (
            <Link href={`/sites/${siteSlug}/${pillar.slug}`} className="blog-btn shrink-0">
              Start with the main guide →
            </Link>
          )}
        </div>
      </section>
    );
  }

  if (!pillar) return null;

  return (
    <section className="border-b" style={{ borderColor: "var(--blog-border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="blog-card overflow-hidden grid md:grid-cols-2 gap-0">
          {pillar.image_url && (
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px] bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pillar.image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <span className="blog-pillar-badge mb-3">Featured guide</span>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              <Link href={`/sites/${siteSlug}/${pillar.slug}`} className="hover:opacity-80 transition-opacity">
                {pillar.title}
              </Link>
            </h2>
            {pillar.excerpt && (
              <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: "var(--blog-muted)" }}>
                {pillar.excerpt}
              </p>
            )}
            <Link href={`/sites/${siteSlug}/${pillar.slug}`} className="blog-btn mt-5 w-fit">
              Read the full guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
