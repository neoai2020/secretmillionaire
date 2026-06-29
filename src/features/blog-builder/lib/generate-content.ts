import { generateWithGPT, extractJsonFromText } from "./ai";
import { BLOG_FORMAT_PROMPT, TONE_PROMPTS } from "./templates";
import { localTerritorySuggestions } from "./local-territory-suggestions";
import type { GeneratedPostContent } from "../types";
import { truncateMeta } from "./seo";

export async function generateBlogPostContent(params: {
  topic: string;
  territory: string;
  hobby: string;
  tone?: string;
  affiliateContext?: string;
  productContext?: string;
}): Promise<GeneratedPostContent> {
  const tone = params.tone ?? "authoritative";
  const system = `${TONE_PROMPTS[tone] ?? TONE_PROMPTS.authoritative}\n\n${BLOG_FORMAT_PROMPT}`;
  const user = `Write a focused SEO affiliate article.

TERRITORY (exact niche — stay on this topic): ${params.territory}
Article angle / headline: ${params.topic}
Category: ${params.hobby}
${params.affiliateContext ? `\nAffiliate links to weave in naturally (mention as recommendations, do not invent URLs):\n${params.affiliateContext}` : ""}
${params.productContext ? `\nProduct/offer page context from affiliate URL:\n${params.productContext}` : ""}

Requirements:
- 550-750 words in the html field
- Highly specific to the territory — mention materials, brands, price ranges, use cases where relevant
- 3-4 <h2> sections with actionable advice for buyers
- excerpt: 1-2 compelling sentences for card previews
- metaDescription: under 155 characters, includes territory keywords
- title: may refine the article angle but must match the territory

Return JSON only.`;

  const raw = await generateWithGPT(system, user, { maxRetries: 2 });
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

  throw new Error("AI returned invalid article format — try again");
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
