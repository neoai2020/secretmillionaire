import { generateWithGPT, extractJsonFromText } from "./ai";
import { BLOG_FORMAT_PROMPT, TONE_PROMPTS } from "./templates";
import { localTerritorySuggestions } from "./local-territory-suggestions";
import type { GeneratedPostContent } from "../types";
import { truncateMeta } from "./seo";

export async function generateBlogPostContent(params: {
  topic: string;
  hobby: string;
  tone?: string;
  affiliateContext?: string;
  productContext?: string;
}): Promise<GeneratedPostContent> {
  const tone = params.tone ?? "conversational";
  const system = `${TONE_PROMPTS[tone] ?? TONE_PROMPTS.conversational}\n\n${BLOG_FORMAT_PROMPT}`;
  const user = `Write a medium-length SEO blog post.

Territory (hobby/niche): ${params.hobby}
Topic/title: ${params.topic}
${params.affiliateContext ? `\nAffiliate context: ${params.affiliateContext}` : ""}
${params.productContext ? `\nProduct/page context: ${params.productContext}` : ""}

Target 800-1200 words in the html field. Include 3-5 <h2> sections.`;

  const raw = await generateWithGPT(system, user);
  const parsed = extractJsonFromText(raw) as Partial<GeneratedPostContent> | null;

  if (parsed?.html && parsed.title) {
    return {
      title: parsed.title,
      excerpt: parsed.excerpt ?? truncateMeta(parsed.html.replace(/<[^>]+>/g, " "), 200),
      metaDescription: truncateMeta(
        parsed.metaDescription ?? parsed.excerpt ?? parsed.title,
        160
      ),
      html: parsed.html,
    };
  }

  const plain = raw.replace(/```[\s\S]*?```/g, "").trim();
  const title = params.topic;
  return {
    title,
    excerpt: truncateMeta(plain, 200),
    metaDescription: truncateMeta(`${title} — expert guide for ${params.hobby}`, 160),
    html: `<p>${plain.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`,
  };
}

export async function suggestTerritories(hobby: string): Promise<string[]> {
  const system =
    "You suggest profitable blog territory angles. Return JSON only: { \"suggestions\": [\"...\"] }";
  const user = `Hobby/interest: "${hobby}". Suggest 6 specific blog territory angles (sub-niches or content themes) that could rank on Google and monetize with affiliate offers.`;

  try {
    const raw = await generateWithGPT(system, user);
    const parsed = extractJsonFromText(raw) as { suggestions?: string[] } | null;
    if (parsed?.suggestions?.length) return parsed.suggestions.slice(0, 6);
  } catch {
    /* fallback */
  }

  return localTerritorySuggestions(hobby);
}
