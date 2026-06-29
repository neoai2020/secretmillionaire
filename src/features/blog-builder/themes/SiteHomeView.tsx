import { PublicSiteRoot } from "./components/PublicSiteRoot";
import { SiteHeader } from "./components/SiteHeader";
import { SiteHero } from "./components/SiteHero";
import { PostList } from "./components/PostList";
import { SiteFooter } from "./components/SiteFooter";
import { resolveTheme } from "./resolve-theme";
import type { PublicPostSummary, PublicSite } from "./types";

interface SiteHomeViewProps {
  site: PublicSite;
  siteSlug: string;
  posts: PublicPostSummary[];
}

export function SiteHomeView({ site, siteSlug, posts }: SiteHomeViewProps) {
  const theme = resolveTheme(site.theme);
  const pillar = posts.find((p) => p.is_pillar);
  const heroShowsPillar = theme.modules.hero === "featured-pillar";
  const excludeSlug = heroShowsPillar ? pillar?.slug : undefined;

  return (
    <PublicSiteRoot theme={theme}>
      {theme.modules.header !== "minimal" && (
        <div className="blog-trust-strip">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 text-center">
            Independent research · Updated guides · No fluff
          </div>
        </div>
      )}
      <SiteHeader site={site} siteSlug={siteSlug} variant={theme.modules.header} />
      <SiteHero variant={theme.modules.hero} site={site} siteSlug={siteSlug} posts={posts} />
      <main>
        <PostList
          posts={posts}
          siteSlug={siteSlug}
          variant={theme.modules.homeList}
          excludeSlug={excludeSlug}
        />
      </main>
      <SiteFooter site={site} siteSlug={siteSlug} variant={theme.modules.footer} relatedPosts={posts} />
    </PublicSiteRoot>
  );
}
