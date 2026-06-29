import type { ClusterTopic } from "../types";
import { slugify } from "./seo";

export const CLUSTER_COUNT = 6;

/** Territory-specific topic angles (not generic hobby fluff). */
export function buildClusterTopics(territory: string, hobby: string): ClusterTopic[] {
  const niche = territory.trim() || hobby.trim();
  const key = slugify(hobby.trim() || niche.slice(0, 48)) || "site";

  return [
    {
      title: `${niche}: The Complete Buyer's Guide`,
      slug: `${key}-complete-guide`,
      isPillar: true,
    },
    {
      title: `Best Picks for ${niche}`,
      slug: `${key}-best-picks`,
      isPillar: false,
    },
    {
      title: `7 Mistakes to Avoid With ${niche}`,
      slug: `${key}-mistakes`,
      isPillar: false,
    },
    {
      title: `${niche} on a Budget — What Actually Works`,
      slug: `${key}-budget`,
      isPillar: false,
    },
    {
      title: `Pro Tips: Getting Results With ${niche}`,
      slug: `${key}-pro-tips`,
      isPillar: false,
    },
    {
      title: `Is ${niche} Worth It? Honest Breakdown`,
      slug: `${key}-worth-it`,
      isPillar: false,
    },
    {
      title: `${niche} for Beginners — Step by Step`,
      slug: `${key}-beginners`,
      isPillar: false,
    },
  ];
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

export const TONE_PROMPTS: Record<string, string> = {
  authoritative:
    "You are an expert affiliate content writer. Write with authority, specificity, and practical buying advice. No fluff or generic filler.",
  conversational:
    "You are a trusted reviewer writing for real buyers. Be friendly, specific, and honest — never generic.",
  bold: "Write in a bold, direct tone. Be clear, specific, and action-oriented.",
};

export const BLOG_FORMAT_PROMPT = `Return ONLY valid JSON (no markdown fences, no commentary).
Required keys: title, excerpt, metaDescription, html.

The html field must be clean semantic article HTML only:
- Use <h2> for section headings (3-4 sections)
- Use <p> for paragraphs, <ul>/<li> for lists
- Do NOT include <html>, <head>, or <body>
- Do NOT use markdown`;
