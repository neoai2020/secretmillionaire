import { PublicSiteRoot } from "./components/PublicSiteRoot";
import { SiteNav } from "./components/SiteNav";
import { ArticleLayout } from "./components/ArticleLayout";
import { SiteFooter } from "./components/SiteFooter";
import { resolveTheme } from "./resolve-theme";
import type { PublicPost, PublicPostSummary, PublicSite } from "./types";

interface SitePostViewProps {
  site: PublicSite;
  siteSlug: string;
  post: PublicPost;
  relatedPosts: PublicPostSummary[];
  jsonLd: Record<string, unknown>;
}

export function SitePostView({ site, siteSlug, post, relatedPosts, jsonLd }: SitePostViewProps) {
  const theme = resolveTheme(site.theme);
  const homeHref = `/sites/${siteSlug}`;

  return (
    <PublicSiteRoot theme={theme}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav site={site} siteSlug={siteSlug} backHref={homeHref} />
      <main className="flex-1">
        <ArticleLayout
          site={site}
          siteSlug={siteSlug}
          post={post}
          layout={theme.modules.postLayout}
          relatedPosts={relatedPosts}
        />
      </main>
      <SiteFooter
        site={site}
        siteSlug={siteSlug}
        variant={theme.modules.footer}
        relatedPosts={relatedPosts}
        currentSlug={post.slug}
      />
    </PublicSiteRoot>
  );
}
