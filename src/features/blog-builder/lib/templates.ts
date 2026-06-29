import type { ClusterTopic } from "../types";
import type { ArticleAngle } from "../types";
import { slugify } from "./seo";

export const CLUSTER_COUNT = 6;

/** Territory-specific topics mapped to SEO search-intent angles. */
export function buildClusterTopics(territory: string, hobby: string): ClusterTopic[] {
  const niche = territory.trim() || hobby.trim();
  const key = slugify(hobby.trim() || niche.slice(0, 48)) || "site";

  const topics: Array<ClusterTopic & { angle: ArticleAngle }> = [
    {
      title: `${niche}: The Complete Buyer's Guide`,
      slug: `${key}-complete-guide`,
      isPillar: true,
      angle: "pillar-guide",
    },
    {
      title: `Best Picks for ${niche}`,
      slug: `${key}-best-picks`,
      isPillar: false,
      angle: "best-picks",
    },
    {
      title: `7 Mistakes to Avoid With ${niche}`,
      slug: `${key}-mistakes`,
      isPillar: false,
      angle: "mistakes",
    },
    {
      title: `${niche} on a Budget — What Actually Works`,
      slug: `${key}-budget`,
      isPillar: false,
      angle: "budget",
    },
    {
      title: `Pro Tips: Getting Results With ${niche}`,
      slug: `${key}-pro-tips`,
      isPillar: false,
      angle: "pro-tips",
    },
    {
      title: `Is ${niche} Worth It? Honest Breakdown`,
      slug: `${key}-worth-it`,
      isPillar: false,
      angle: "worth-it",
    },
    {
      title: `${niche} for Beginners — Step by Step`,
      slug: `${key}-beginners`,
      isPillar: false,
      angle: "beginners",
    },
  ];

  return topics;
}

export function buildInternalLinks(
  topics: ClusterTopic[],
  siteSlug: string,
  currentSlug: string
): string {
  const pillar = topics.find((t) => t.isPillar);
  const clusters = topics.filter((t) => !t.isPillar && t.slug !== currentSlug).slice(0, 4);
  const links = [
    ...(pillar && pillar.slug !== currentSlug
      ? [`<li><a href="/sites/${siteSlug}/${pillar.slug}">${pillar.title}</a></li>`]
      : []),
    ...clusters.map(
      (t) => `<li><a href="/sites/${siteSlug}/${t.slug}">${t.title}</a></li>`
    ),
  ];
  if (links.length === 0) return "";
  return `<section class="sms-related" style="margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid #eee;">
    <h2 style="font-size:1.25rem;margin-bottom:1rem;">Related in this territory</h2>
    <ul style="line-height:1.8;padding-left:1.25rem;">${links.join("")}</ul>
  </section>`;
}

/** @deprecated Use prompts.ts — kept for imports that referenced tone keys. */
export const TONE_PROMPTS: Record<string, string> = {
  authoritative: "authoritative",
  conversational: "conversational",
  bold: "bold",
};

/** @deprecated Use prompts.ts ARTICLE_SYSTEM_PROMPT. */
export const BLOG_FORMAT_PROMPT = "See prompts.ts";
