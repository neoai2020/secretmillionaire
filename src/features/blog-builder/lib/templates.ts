import type { ClusterTopic } from "../types";
import { slugify } from "./seo";

export const CLUSTER_COUNT = 6;

export function buildClusterTopics(hobby: string): ClusterTopic[] {
  const h = hobby.trim();
  const topics: ClusterTopic[] = [
    {
      title: `The Complete Guide to ${h}`,
      slug: slugify(`complete-guide-${h}`),
      isPillar: true,
    },
    {
      title: `Best ${h} Gear for Beginners`,
      slug: slugify(`best-${h}-gear-beginners`),
      isPillar: false,
    },
    {
      title: `${h} Mistakes to Avoid`,
      slug: slugify(`${h}-mistakes-to-avoid`),
      isPillar: false,
    },
    {
      title: `How to Start ${h} on a Budget`,
      slug: slugify(`start-${h}-on-budget`),
      isPillar: false,
    },
    {
      title: `Top ${h} Tips for Faster Results`,
      slug: slugify(`${h}-tips-faster-results`),
      isPillar: false,
    },
    {
      title: `Is ${h} Worth It? Honest Review`,
      slug: slugify(`is-${h}-worth-it`),
      isPillar: false,
    },
    {
      title: `${h} for Beginners: Step-by-Step`,
      slug: slugify(`${h}-beginners-step-by-step`),
      isPillar: false,
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

export const TONE_PROMPTS: Record<string, string> = {
  authoritative:
    "Write in an authoritative, expert tone. Use confident language and practical advice.",
  conversational:
    "Write in a friendly, conversational tone. Connect with the reader emotionally.",
  bold: "Write in a bold, direct tone. Be clear and action-oriented.",
};

export const BLOG_FORMAT_PROMPT = `Format as a SEO blog article using clean semantic HTML only (no markdown).
Use <h2> for section headings, <p> for paragraphs, <ul>/<li> for lists.
Do NOT include <html>, <head>, or <body> tags.
Return valid JSON with keys: title, excerpt, metaDescription, html.
The html field must be article body HTML only.`;
